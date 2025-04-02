require("dotenv").config();
const express = require("express");
const connectDB = require("./config/dbconfig");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const userRoutes=require('./routes/userRoutes');
const PORT = process.env.PORT || 8000;
const path = require("path");

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); //to be removed when using gcs

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users",userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
