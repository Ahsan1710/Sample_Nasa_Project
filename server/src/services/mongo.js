const mongoose = require("mongoose");

require("dotenv").config();

mongoose.connection.once("open", () => {
  console.log("MongoDB connected successfully!!");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

const MongoDB_URL = process.env.MongoDB_URL;

async function connectDB() {
  await mongoose.connect(MongoDB_URL);
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = {
  connectDB,
  disconnectDB,
};
