const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    externalId: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

postSchema.index({ title: "text", body: "text" });

module.exports = mongoose.model("Post", postSchema);
