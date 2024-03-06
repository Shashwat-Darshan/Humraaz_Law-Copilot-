const mongoose = require('mongoose');

const representationSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  location: {
    state: { type: String },
    city: { type: String },
    block: { type: String }
  },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('Representation', representationSchema);
