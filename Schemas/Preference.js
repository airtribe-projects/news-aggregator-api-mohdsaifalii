const mongoose = require("mongoose");

const PreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  categories: { type: [String], default: [] },
  languages: { type: [String], default: [] },
});

module.exports = mongoose.model("Preference", PreferenceSchema);
