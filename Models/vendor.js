const mongoose = require('mongoose')

const vendorModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      contact: {
        type: Number,
        required: true,
        unique:true
      }
},{timestamps:true})

const vendors = mongoose.model("vendors",vendorModel);
module.exports = vendors;