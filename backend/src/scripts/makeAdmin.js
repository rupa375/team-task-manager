require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const email = process.argv[2];
if (!email) {
  console.log("Usage: node src/scripts/makeAdmin.js your@email.com");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  );
  if (!user) {
    console.log("❌ User not found. Sign up first then run this.");
  } else {
    console.log(`✅ ${user.name} is now ADMIN`);
  }
  process.exit(0);
}).catch((err) => {
  console.log("❌ DB connection failed:", err.message);
  process.exit(1);
});