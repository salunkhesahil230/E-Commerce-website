import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import { Type } from "./entities/Type";
import { Category } from "./entities/Category";
import { SubCategory } from "./entities/SubCategory";
import { Product } from "./entities/Product";
import { Cart } from "./entities/Cart";
import bcrypt from "bcrypt";

async function seed() {
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const userRepo = AppDataSource.getRepository(User);
    const cartRepo = AppDataSource.getRepository(Cart);
    const typeRepo = AppDataSource.getRepository(Type);
    const categoryRepo = AppDataSource.getRepository(Category);
    const subCategoryRepo = AppDataSource.getRepository(SubCategory);
    const productRepo = AppDataSource.getRepository(Product);

    // Admin Account
    const existingAdmin = await userRepo.findOne({ where: { email: "admin@gmail.com" } });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 12);
        const admin = userRepo.create({
            name: "Admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin",
        });
        await userRepo.save(admin);
        console.log("✅ Admin created — email: admin@gmail.com | password: admin123");
    }

    // Demo Customer
    const existingCustomer = await userRepo.findOne({ where: { email: "customer@shop.com" } });
    if (!existingCustomer) {
        const hashedPassword = await bcrypt.hash("customer123", 12);
        const customer = userRepo.create({
            name: "John Doe",
            email: "customer@shop.com",
            password: hashedPassword,
            role: "customer",
        });
        const savedCustomer = await userRepo.save(customer);
        const cart = cartRepo.create({ user: savedCustomer });
        await cartRepo.save(cart);
        console.log("✅ Customer created — email: customer@shop.com | password: customer123");
    }

    // Types 
    const electronicsType = await getOrCreate(typeRepo, { name: "Electronics" });
    const stationeryType = await getOrCreate(typeRepo, { name: "Stationery" });
    const furnitureType = await getOrCreate(typeRepo, { name: "Furniture" });
    const clothingType = await getOrCreate(typeRepo, { name: "Clothing" });
    console.log("✅ Types created");

    // Categories
    const peripheralsCategory = await getOrCreate(categoryRepo, { name: "Computer Peripherals" }, { type: electronicsType });
    const phonesCategory = await getOrCreate(categoryRepo, { name: "Mobile Phones" }, { type: electronicsType });
    const laptopsCategory = await getOrCreate(categoryRepo, { name: "Laptops" }, { type: electronicsType });

    const officeStationery = await getOrCreate(categoryRepo, { name: "Office Supplies" }, { type: stationeryType });
    const kidsStationery = await getOrCreate(categoryRepo, { name: "Kids" }, { type: stationeryType });

    const officeFurniture = await getOrCreate(categoryRepo, { name: "Office Furniture" }, { type: furnitureType });
    const homeFurniture = await getOrCreate(categoryRepo, { name: "Home Furniture" }, { type: furnitureType });

    const mensClothing = await getOrCreate(categoryRepo, { name: "Mens Clothing" }, { type: clothingType });
    const womensClothing = await getOrCreate(categoryRepo, { name: "Womens Clothing" }, { type: clothingType });
    console.log("✅ Categories created");

    // SubCategories
    const keyboardsSub = await getOrCreate(subCategoryRepo, { name: "Keyboards" }, { category: peripheralsCategory });
    const mousesSub = await getOrCreate(subCategoryRepo, { name: "Mouse" }, { category: peripheralsCategory });
    const monitorsSub = await getOrCreate(subCategoryRepo, { name: "Monitors" }, { category: peripheralsCategory });

    const smartphonesSub = await getOrCreate(subCategoryRepo, { name: "Smartphones" }, { category: phonesCategory });
    const accessoriesSub = await getOrCreate(subCategoryRepo, { name: "Phone Accessories" }, { category: phonesCategory });

    const gamingLaptopsSub = await getOrCreate(subCategoryRepo, { name: "Gaming Laptops" }, { category: laptopsCategory });
    const officeLaptopsSub = await getOrCreate(subCategoryRepo, { name: "Office Laptops" }, { category: laptopsCategory });

    const pensSub = await getOrCreate(subCategoryRepo, { name: "Pens" }, { category: officeStationery });
    const notebooksSub = await getOrCreate(subCategoryRepo, { name: "Notebooks" }, { category: officeStationery });

    const textbooksSub = await getOrCreate(subCategoryRepo, { name: "Textbooks" }, { category: kidsStationery });

    const desksSub = await getOrCreate(subCategoryRepo, { name: "Desks" }, { category: officeFurniture });
    const chairsSub = await getOrCreate(subCategoryRepo, { name: "Chairs" }, { category: officeFurniture });

    const tablesSub = await getOrCreate(subCategoryRepo, { name: "Tables" }, { category: homeFurniture });
    const sofasSub = await getOrCreate(subCategoryRepo, { name: "Sofas" }, { category: homeFurniture });

    const tshirtsSub = await getOrCreate(subCategoryRepo, { name: "T-Shirts" }, { category: mensClothing });
    const dressesSub = await getOrCreate(subCategoryRepo, { name: "Dresses" }, { category: womensClothing });
    console.log("✅ SubCategories created");

    // Products 
    const products = [
        // Electronics - Keyboards
        { name: "Anker Multimedia Keyboard", description: "Full-size wireless keyboard with multimedia keys and long battery life", price: 1299, stock: 50, subCategory: keyboardsSub },
        { name: "Mechanical Gaming Keyboard RGB", description: "Tactile mechanical switches with RGB backlighting for gaming", price: 3499, stock: 30, subCategory: keyboardsSub },
        { name: "Slim Bluetooth Keyboard", description: "Ultra-slim portable keyboard compatible with all devices", price: 899, stock: 75, subCategory: keyboardsSub },

        // Electronics - Mouse
        { name: "Logitech Wireless Mouse", description: "Ergonomic wireless mouse with precision tracking and long battery life", price: 999, stock: 60, subCategory: mousesSub },
        { name: "Gaming Mouse 16000 DPI", description: "High precision gaming mouse with adjustable DPI and RGB lighting", price: 2499, stock: 25, subCategory: mousesSub },

        // Electronics - Monitors
        { name: "24 inch FHD Monitor", description: "Full HD IPS display with 75Hz refresh rate and eye care technology", price: 12999, stock: 15, subCategory: monitorsSub },
        { name: "27 inch 4K Monitor", description: "Ultra sharp 4K display perfect for creative professionals", price: 28999, stock: 8, subCategory: monitorsSub },

        // Electronics - Smartphones
        { name: "Samsung Galaxy A54", description: "6.4 inch Super AMOLED display, 50MP camera, 5000mAh battery", price: 32999, stock: 20, subCategory: smartphonesSub },
        { name: "Redmi Note 13 Pro", description: "200MP camera, 120Hz AMOLED display, fast charging", price: 24999, stock: 35, subCategory: smartphonesSub },
        { name: "iPhone 15", description: "A16 Bionic chip, 48MP camera system, Dynamic Island", price: 79999, stock: 10, subCategory: smartphonesSub },

        // Electronics - Phone Accessories
        { name: "USB-C Fast Charger 65W", description: "GaN technology fast charger compatible with all USB-C devices", price: 1499, stock: 100, subCategory: accessoriesSub },
        { name: "Wireless Earbuds Pro", description: "Active noise cancellation, 30hr battery, IPX4 water resistant", price: 3999, stock: 45, subCategory: accessoriesSub },

        // Electronics - Gaming Laptops
        { name: "ASUS ROG Strix G15", description: "AMD Ryzen 9, RTX 4060, 16GB RAM, 512GB SSD, 144Hz display", price: 89999, stock: 5, subCategory: gamingLaptopsSub },
        { name: "Lenovo IdeaPad Gaming 3", description: "Intel i5, RTX 3050, 8GB RAM, 512GB SSD", price: 54999, stock: 12, subCategory: gamingLaptopsSub },

        // Electronics - Office Laptops
        { name: "Dell Inspiron 15", description: "Intel i5, 8GB RAM, 256GB SSD, perfect for office work", price: 42999, stock: 18, subCategory: officeLaptopsSub },
        { name: "HP Pavilion 14", description: "AMD Ryzen 5, 8GB RAM, 512GB SSD, thin and light design", price: 38999, stock: 22, subCategory: officeLaptopsSub },

        // Stationery - Pens
        { name: "Parker Ballpoint Pen Set", description: "Premium ballpoint pen set with smooth writing experience", price: 599, stock: 200, subCategory: pensSub },
        { name: "Pilot G2 Gel Pen Pack", description: "Pack of 12 smooth gel pens in assorted colors", price: 299, stock: 300, subCategory: pensSub },

        // Stationery - Notebooks
        { name: "Classmate Notebook A4 Pack", description: "Pack of 6 ruled notebooks, 200 pages each", price: 199, stock: 500, subCategory: notebooksSub },
        { name: "Leather Bound Journal", description: "Premium leather journal with 240 pages of cream paper", price: 799, stock: 80, subCategory: notebooksSub },

        // Stationery - Textbooks
        { name: "Multiplication Table Book", description: "Colorful multiplication tables book for kids aged 6-12", price: 149, stock: 400, subCategory: textbooksSub },
        { name: "English Grammar Workbook", description: "Comprehensive grammar workbook for primary school students", price: 249, stock: 250, subCategory: textbooksSub },

        // Furniture - Desks
        { name: "Study Table with Shelves", description: "Wooden study table with built-in shelves and cable management", price: 8999, stock: 10, subCategory: desksSub },
        { name: "Standing Desk Adjustable", description: "Electric height adjustable standing desk for healthy work posture", price: 24999, stock: 6, subCategory: desksSub },

        // Furniture - Chairs
        { name: "Ergonomic Office Chair", description: "Lumbar support, adjustable height and armrests for all day comfort", price: 12999, stock: 14, subCategory: chairsSub },
        { name: "Gaming Chair RGB", description: "Racing style gaming chair with RGB lighting and reclining feature", price: 15999, stock: 8, subCategory: chairsSub },

        // Furniture - Tables
        { name: "Wooden Dining Table 6 Seater", description: "Solid sheesham wood dining table with classic finish", price: 32999, stock: 4, subCategory: tablesSub },
        { name: "Coffee Table Glass Top", description: "Modern tempered glass coffee table with wooden legs", price: 7999, stock: 12, subCategory: tablesSub },

        // Furniture - Sofas
        { name: "3 Seater Fabric Sofa", description: "Comfortable fabric sofa with high density foam cushions", price: 18999, stock: 7, subCategory: sofasSub },

        // Clothing
        { name: "Cotton Round Neck T-Shirt", description: "100% pure cotton comfortable round neck t-shirt for men", price: 399, stock: 150, subCategory: tshirtsSub },
        { name: "Floral Summer Dress", description: "Light and breezy floral print summer dress for women", price: 899, stock: 80, subCategory: dressesSub },
    ];

    for (const p of products) {
        const existing = await productRepo.findOne({ where: { name: p.name } });
        if (!existing) {
            const product = productRepo.create(p);
            await productRepo.save(product);
        }
    }
    console.log("✅ Products created");
    console.log("🎉 Seed completed successfully!");
    process.exit(0);
}

// Helper to get or create entity
async function getOrCreate(repo: any, findOptions: any, extraData: any = {}) {
    const existing = await repo.findOne({ where: findOptions });
    if (existing) return existing;
    const entity = repo.create({ ...findOptions, ...extraData });
    return await repo.save(entity);
}

seed().catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
});