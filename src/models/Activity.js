import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vault: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vault",
    },
    action: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["member", "money", "file", "vault", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);
