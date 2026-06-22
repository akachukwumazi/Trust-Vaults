import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

const MONGO_URI = process.env.DATABASE_URL || "mongodb+srv://victorysonham_db_user:x1HNHXITr13ExVVP@cluster0.rikoiyc.mongodb.net/?appName=Cluster0";

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Aka08070870159@", 12);

    const admin = await User.create({
      name: "Admin User",
      email: "maziakachukwu@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("Error during admin seeding:", err);
    process.exit(1);
  }
};

seedAdmin();