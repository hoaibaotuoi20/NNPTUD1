const express = require('express')
let router = express.Router()
let slugify = require('slugify')
let productSchema = require('../schemas/products');//DBset/DBContext

router.get('/:id', async (req, res) => {//req.params
    try {
        let dataProduct = await productSchema.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!dataProduct) {
            res.status(404).send(
                { message: "ID NOT FOUND" }
            )
        } else {
            res.send(dataProduct)
        }
    } catch (error) {
        res.status(404).send(
            { message: "something went wrong" }
        )
    }
})

router.get('/', async (req, res) => {//req.params
    try {
        let dataProducts = await productSchema.find({
            isDeleted: false
        });
        res.send(dataProducts)
    } catch (error) {
        res.status(500).send(
            { message: "something went wrong" }
        )
    }
})

router.post('/', async function (req, res, next) {
    try {
        let slug = slugify(req.body.title, {
            replacement: '-',
            lower: false,
            remove: undefined,
        });

        // Remove undefined fields to fallback to Mongoose defaults if needed
        let productData = {
            title: req.body.title,
            slug: slug
        };
        if (req.body.price !== undefined) productData.price = req.body.price;
        if (req.body.description !== undefined) productData.description = req.body.description;
        if (req.body.images !== undefined) productData.images = req.body.images;
        if (req.body.category !== undefined) productData.category = req.body.category;

        let newItem = new productSchema(productData);
        await newItem.save();
        res.send(newItem)
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

router.put('/:id', async function (req, res, next) {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title, {
                replacement: '-',
                lower: false,
                remove: undefined,
            });
        }
        let getItem = await productSchema.findByIdAndUpdate(
            req.params.id, req.body, {
            new: true
        });
        if (getItem) {
            res.send(getItem)
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send(
            { message: error.message }
        )
    }
})

router.delete('/:id', async function (req, res, next) {
    try {
        let getItem = await productSchema.findOne({
            isDeleted: false,
            _id: req.params.id
        });
        if (!getItem) {
            res.status(404).send(
                { message: "ID NOT FOUND" }
            )
        } else {
            getItem.isDeleted = true
            await getItem.save();
            res.send(getItem)
        }

    } catch (error) {
        res.status(404).send(
            { message: error.message }
        )
    }
})

module.exports = router;