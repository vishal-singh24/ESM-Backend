const mongoose = require("mongoose");

const GpsDetailSchema = new mongoose.Schema(
  {
    timeAndDate: { type: Date, required: true },
    userId: {
      type: String,
      required: true,
    },
    district: { type: String },
    routeStartPoint: { type: String },
    lengthInKm: { type: Number },

    startPointCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    currentWaypointCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },

    substationName: { type: String },
    feederName: { type: String },
    conductor: { type: String },
    cable: { type: String },

    transformerLocation: { type: String },
    transformerKV: { type: String },

    ltDistributionBox3Phase: { type: Boolean, default: false },
    abSwitch: { type: Boolean, default: false },
    anchorRod: { type: Boolean, default: false },
    anchoringAssembly: { type: Boolean, default: false },

    angle4Feet: { type: Number, default: 0 },
    angle9Feet: { type: Number, default: 0 },
    basePlate: { type: Number, default: 0 },
    channel4Feet: { type: Number, default: 0 },
    channel9Feet: { type: Number, default: 0 },
    doChannel: { type: Number, default: 0 },
    doChannelBackClamp: { type: Number, default: 0 },
    doFuse: { type: Number, default: 0 },
    discHardware: { type: Number, default: 0 },
    discInsulatorPorcelain: { type: Number, default: 0 },
  },
  { _id: false }
);

const WaypointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    distanceFromPrevious: { type: Number }, // in meters or km
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    isEnd: { type: Boolean, default: false },

    poleDetails: [{ type: mongoose.Schema.Types.Mixed }],
    gpsDetails: [GpsDetailSchema],

    timestamp: { type: Date, default: Date.now },
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
  waypoints: [[WaypointSchema]],
});

ProjectSchema.pre("save", async function (next) {
  if (this.isNew && !this.projectId) {
    const count = await mongoose.model("Project").countDocuments();
    this.projectId = `Project_${count + 1}`;
  }
  next();
});

module.exports = mongoose.model("Project", ProjectSchema);
