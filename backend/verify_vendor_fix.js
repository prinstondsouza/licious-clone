// unused code

import mongoose from "mongoose";
import dotenv from "dotenv";
import Vendor from "./models/vendorModel.js";
import BaseProduct from "./models/baseProductModel.js";
import VendorProduct from "./models/vendorProductModel.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const verify = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        // Cleanup test data
        const email = "testvendor_unique@example.com";
        await Vendor.deleteOne({ email });
        const vendor = await Vendor.create({
            storeName: "Test Store",
            ownerName: "Test Owner",
            email,
            password: "password123",
            phone: "1234567890",
            status: "approved"
        });
        console.log("Created test vendor:", vendor._id);

        // Test 1: Create standalone product 1
        console.log("Creating standalone product 1...");
        const p1 = await VendorProduct.create({
            vendor: vendor._id,
            name: "Standalone 1",
            category: "Chicken",
            price: 100,
            addedBy: vendor._id
        });
        console.log("Created P1:", p1._id);

        // Test 2: Create standalone product 2
        console.log("Creating standalone product 2...");
        const p2 = await VendorProduct.create({
            vendor: vendor._id,
            name: "Standalone 2",
            category: "Chicken",
            price: 150,
            addedBy: vendor._id
        });
        console.log("Created P2:", p2._id); // Should succeed now

        // Test 3: Create Linked Product
        console.log("Creating BaseProduct...");
        const base = await BaseProduct.create({
            name: "Base Chicken",
            category: "Chicken",
            description: "Base Desc",
            basePrice: 50,
            image: "img.jpg"
        });
        console.log("Created Base:", base._id);

        console.log("Creating Linked Product...");
        const linked1 = await VendorProduct.create({
            vendor: vendor._id,
            baseProduct: base._id,
            price: 60,
            addedBy: vendor._id
        });
        console.log("Created Linked 1:", linked1._id);

        // Test 4: Create Same Linked Product -> Should Fail
        console.log("Creating Duplicate Linked Product (Expect Failure)...");
        try {
            await VendorProduct.create({
                vendor: vendor._id,
                baseProduct: base._id,
                price: 70,
                addedBy: vendor._id
            });
            console.error("ERROR: Duplicate Linked Product succeeded! Index is broken.");
        } catch (e) {
            console.log("Success: Duplicate Linked Product failed as expected.");
        }

        // Cleanup
        await VendorProduct.deleteMany({ vendor: vendor._id });
        await Vendor.deleteOne({ _id: vendor._id });
        await BaseProduct.deleteOne({ _id: base._id });

        console.log("Verification Complete!");
        process.exit(0);

    } catch (error) {
        console.error("Verification Failed:", error);
        process.exit(1);
    }
};

verify();
