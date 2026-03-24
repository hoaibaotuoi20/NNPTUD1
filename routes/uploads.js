var express = require("express");
var router = express.Router();
let { uploadImage, uploadExcel } = require('../utils/uploadHandler')
let exceljs = require('exceljs')
let path = require('path')
let fs = require('fs')
let mongoose = require('mongoose');
let productModel = require('../schemas/products')
let inventoryModel = require('../schemas/inventories')
let categoryModel = require('../schemas/categories')
let slugify = require('slugify')
let userModel = require('../schemas/users')
let roleModel = require('../schemas/roles')
let userController = require('../controllers/users')
let { sendImportMail } = require('../utils/mailHandler')
let crypto = require('crypto')

router.post('/an_image', uploadImage.single('file')
    , function (req, res, next) {
        if (!req.file) {
            res.send({
                message: "file khong duoc rong"
            })
        } else {
            res.send({
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size
            })
        }
    })
router.get('/:filename', function (req, res, next) {
    let filename = path.join(__dirname, '../uploads', req.params.filename)
    res.sendFile(filename)
})

router.post('/multiple_images', uploadImage.array('files', 5)
    , function (req, res, next) {
        if (!req.files) {
            res.send({
                message: "file khong duoc rong"
            })
        } else {
            // res.send({
            //     filename: req.file.filename,
            //     path: req.file.path,
            //     size: req.file.size
            // })

            res.send(req.files.map(f => {
                return {
                    filename: f.filename,
                    path: f.path,
                    size: f.size
                }
            }))
        }
    })

router.post('/excel', uploadExcel.single('file')
    , async function (req, res, next) {
        if (!req.file) {
            res.send({
                message: "file khong duoc rong"
            })
        } else {
            //wookbook->worksheet->row/column->cell
            let workBook = new exceljs.Workbook()
            let filePath = path.join(__dirname, '../uploads', req.file.filename)
            await workBook.xlsx.readFile(filePath)
            let worksheet = workBook.worksheets[0];
            let result = [];

            let categoryMap = new Map();
            let categories = await categoryModel.find({
            })
            for (const category of categories) {
                categoryMap.set(category.name, category._id)
            }

            let products = await productModel.find({})
            let getTitle = products.map(
                p => p.title
            )
            let getSku = products.map(
                p => p.sku
            )

            for (let index = 2; index <= worksheet.rowCount; index++) {
                let errorsRow = [];
                const element = worksheet.getRow(index);
                let sku = element.getCell(1).value;
                let title = element.getCell(2).value;
                let category = element.getCell(3).value;
                let price = Number.parseInt(element.getCell(4).value);
                let stock = Number.parseInt(element.getCell(5).value);

                if (price < 0 || isNaN(price)) {
                    errorsRow.push("price khong duoc nho hon 0 va la so")
                }
                if (stock < 0 || isNaN(stock)) {
                    errorsRow.push("stock khong duoc nho hon 0 va la so")
                }
                if (!categoryMap.has(category)) {
                    errorsRow.push("category khong hop le")
                }
                if (getSku.includes(sku)) {
                    errorsRow.push("sku da ton tai")
                }
                if (getTitle.includes(title)) {
                    errorsRow.push("title da ton tai")
                }

                if (errorsRow.length > 0) {
                    result.push({
                        success: false,
                        data: errorsRow
                    })
                    continue;
                }
                let session = await mongoose.startSession()
                session.startTransaction()
                try {
                    let newProducts = new productModel({
                        sku: sku,
                        title: title,
                        slug: slugify(title, {
                            replacement: '-',
                            lower: false,
                            remove: undefined,
                        }),
                        description: title,
                        category: categoryMap.get(category),
                        price: price
                    })
                    await newProducts.save({ session })
                    let newInventory = new inventoryModel({
                        product: newProducts._id,
                        stock: stock
                    })
                    await newInventory.save({ session });
                    await newInventory.populate('product')
                    await session.commitTransaction();
                    await session.endSession()
                    getTitle.push(title);
                    getSku.push(sku)
                    result.push({
                        success: true,
                        data: newInventory
                    })
                } catch (error) {
                    await session.abortTransaction();
                    await session.endSession()
                    result.push({
                        success: false,
                        data: error.message
                    })
                }
            }
            fs.unlinkSync(filePath)
            result = result.map((r, index) => {
                if (r.success) {
                    return {
                        [index + 1]: r.data
                    }
                } else {
                    return {
                        [index + 1]: r.data.join(',')
                    }
                }
            })
            res.send(result)
        }

    })

router.post('/import_users', uploadExcel.single('file'), async function (req, res, next) {
    if (!req.file) {
        return res.status(400).send({ message: "Vui lòng chọn file Excel để import user" });
    }

    let filePath = path.join(__dirname, '../uploads', req.file.filename);
    try {
        let workBook = new exceljs.Workbook();
        await workBook.xlsx.readFile(filePath);
        let worksheet = workBook.worksheets[0];
        let result = [];

        // Tìm role mặc định là 'user' (không phân biệt hoa thường)
        let defaultRole = await roleModel.findOne({ name: { $regex: /user/i } });
        if (!defaultRole) {
            // Fallback lấy role đầu tiên nếu không thấy 'user'
            defaultRole = await roleModel.findOne({});
        }

        for (let index = 2; index <= worksheet.rowCount; index++) {
            const row = worksheet.getRow(index);
            let username = row.getCell(1).value;
            let email = row.getCell(2).value;

            // Xử lý dữ liệu username/email (lấy text nếu là hyperlink/object)
            if (username && typeof username === 'object') username = username.text || username.result;
            if (email && typeof email === 'object') email = email.text || email.result;

            if (!username || !email) continue;

            // Kiểm tra user tồn tại chưa
            let existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                result.push({ row: index, username, success: false, message: "Username hoặc Email đã tồn tại" });
                continue;
            }

            // Tạo password ngẫu nhiên chính xác 16 ký tự (8 bytes = 16 hex chars)
            const rawPassword = crypto.randomBytes(8).toString('hex');

            try {
                // Tạo user mới (Không dùng session/transaction để tương thích với máy local)
                await userController.CreateAnUser(
                    username, 
                    rawPassword, 
                    email, 
                    defaultRole ? defaultRole._id : undefined, 
                    undefined, // session: null
                    username, // fullName mặc định là username
                    undefined, // avatar
                    true // status: active
                );

                result.push({ 
                    row: index, 
                    username, 
                    success: true, 
                    data: { email, rawPassword } 
                });
            } catch (error) {
                console.error("Lỗi dòng " + index + ":", error.message);
                result.push({ row: index, username, success: false, message: error.message });
            }
        }

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.send({
            message: "Hoàn tất quá trình import user",
            total: result.length,
            results: result
        });

        // CHẠY NGẦM: Gửi 99 email từ từ sau khi Postman đã hiện kết quả (Không làm đứng máy)
        (async () => {
            for (let r of result) {
                if (r.success) {
                    try {
                        await sendImportMail(r.data.email, r.username, r.data.rawPassword);
                        await new Promise(resolve => setTimeout(resolve, 500)); // Delay 0.5s chống Rate Limit
                    } catch (err) {
                        console.error("Lỗi gửi mail user " + r.username + ":", err.message);
                    }
                }
            }
        })();

    } catch (error) {
        let filePath = path.join(__dirname, '../uploads', req.file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).send({ message: "Lỗi xử lý import: " + error.message });
    }
});

module.exports = router;