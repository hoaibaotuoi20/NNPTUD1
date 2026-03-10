// Câu 1: Khai báo constructor function Product
function Product(id, name, price, quantity, category, isAvailable) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.category = category;
    this.isAvailable = isAvailable;
}

// Câu 2: Khởi tạo mảng products (6 sản phẩm, 2 danh mục)
const products = [
    new Product(1, "iPhone 15", 25000000, 10, "Electronics", true),
    new Product(2, "Macbook M3", 35000000, 5, "Electronics", true),
    new Product(3, "Chuột Logitech", 500000, 0, "Accessories", true),
    new Product(4, "Bàn phím cơ", 1200000, 20, "Accessories", true),
    new Product(5, "Samsung S24", 22000000, 15, "Electronics", true),
    new Product(6, "Tai nghe Sony", 4000000, 8, "Accessories", false)
];

console.log("--- Danh sách sản phẩm ban đầu ---", products);

// Câu 3: Tạo mảng mới chỉ chứa name và price
const nameAndPrice = products.map(p => ({ name: p.name, price: p.price }));
console.log("Câu 3:", nameAndPrice);

// Câu 4: Lọc các sản phẩm còn hàng (quantity > 0)
const inStock = products.filter(p => p.quantity > 0);
console.log("Câu 4:", inStock);

// Câu 5: Kiểm tra có ít nhất 1 sản phẩm giá > 30.000.000
const hasExpensiveProduct = products.some(p => p.price > 30000000);
console.log("Câu 5:", hasExpensiveProduct);

// Câu 6: Kiểm tra tất cả sp "Accessories" có đang bán (isAvailable = true)
const allAccAvailable = products
    .filter(p => p.category === "Accessories")
    .every(p => p.isAvailable === true);
console.log("Câu 6:", allAccAvailable);

// Câu 7: Tính tổng giá trị kho hàng (price * quantity)
const totalValue = products.reduce((total, p) => total + (p.price * p.quantity), 0);
console.log("Câu 7: Tổng giá trị kho =", totalValue.toLocaleString(), "VND");

// Câu 8: Dùng for...of in ra: Tên - Danh mục - Trạng thái
console.log("Câu 8:");
for (const p of products) {
    const status = p.isAvailable ? "Đang bán" : "Ngừng bán";
    console.log(`${p.name} - ${p.category} - ${status}`);
}

// Câu 9: Dùng for...in để in ra thuộc tính và giá trị (ví dụ cho sp đầu tiên)
console.log("Câu 9 (Ví dụ SP1):");
for (const key in products[0]) {
    console.log(`${key}: ${products[0][key]}`);
}

// Câu 10: Lấy danh sách tên các sản phẩm đang bán và còn hàng
const availableNames = products
    .filter(p => p.isAvailable && p.quantity > 0)
    .map(p => p.name);
console.log("Câu 10:", availableNames);