const mongoose = require("mongoose");

const WaypointSchema = new mongoose.Schema(
  {
    coordinates: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String },
    images: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: true }
);

const ProjectSchema = new mongoose.Schema({
  projectId: { type: String, unique: true },
  circle: { type: String, required: true },
  division: { type: String, required: true },
  description: { type: String, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  waypoints: [WaypointSchema]
});

ProjectSchema.pre("save", async function (next) {
  if (this.isNew && !this.projectId) {
    const count = await mongoose.model("Project").countDocuments();
    this.projectId = `Project_${count + 1}`;
  }
  next();
});

WaypointSchema.index({ coordinates: "2dsphere" });
module.exports = mongoose.model("Project", ProjectSchema);
