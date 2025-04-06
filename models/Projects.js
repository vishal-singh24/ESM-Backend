const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectId: { type: String, unique: true },
  circle: { type: String, required: true },
  division: { type: String, required: true },
  description: { type: String, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

ProjectSchema.pre("save", async function (next) {
  if (this.isNew && !this.projectId) {
    const count = await mongoose.model("Project").countDocuments();
    this.projectId = `Project_${count + 1}`;
  }
  next();
});

module.exports = mongoose.model("Project", ProjectSchema);
