const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true, required: true },
  email: { type: String, default: null },
  mobileNo: {
    type: String,
    default: null,
    validate: {
      validator: function (v) {
        return /^\+91[0-9]{10}$/.test(v); 
      },
      message: (props) => `${props.value} is not a valid Indian mobile number!`,
    },
  },
  password: { type: String, required: true },
  image: { type: String, default: null },
  role: { type: String, enum: ["admin", "employee"], required: true },
});

UserSchema.pre("save", function (next) {
  if (!this.mobileNo.startsWith("+91")) {
    this.mobileNo = "+91" + this.mobileNo;
  }
  next();
});
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
