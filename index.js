require("dotenv").config();
const express = require("express");
const connectDB = require("./config/dbconfig");
const app = express();
const authRoutes = require("./routes/authRoutes");
const projectRoutes=require("./routes/projectRoutes")
const PORT = process.env.PORT || 8000;

connectDB();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use('/api/projects',projectRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
