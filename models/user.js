const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    state: { type: String },
    city: { type: String },
    block: { type: String }
  },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
