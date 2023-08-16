const mongoose = require("mongoose");

let proposal = new mongoose.Schema({
  Event_Name: { type: String, required: true },
  Place_of_event: { type: String, required: true },
  Proposal_type: { type: String, required: true },
  Budget: { type: String, required: true },
  Event_type: { type: String, required: true },
  From_date: { type: String, required: true },
  To_date: { type: String, required: true },
  Description: { type: String, required: true },
  Budget: { type: String, required: true },
  Images: { type: Array, required: true },
  Food_preferances: { type: String, required: true },
  Events: { type: String, required: true },
  Vendor_id:{type:mongoose.Schema.Types.ObjectId,ref:'vendors',required:true},
  Vendor_name:{ type: String, required: true },
  Vendor_email:{ type: String, required: true }
});

let proposalmodel = mongoose.model("proposals", proposal);

module.exports = proposalmodel;
