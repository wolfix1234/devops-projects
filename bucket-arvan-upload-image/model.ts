import mongoose from "mongoose";

const imageschema = new mongoose.Schema({
  imagesName: {
    type: String,
    required: true
  },
  imagesUrl: {
    type: String,
    required: true
  },
  imagesType: {
    type: String,
    required: true
  },
  imagesize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  storeId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const images = mongoose.models.images || mongoose.model("images", imageschema);

export default images;
