const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  trelloId: {
    type: String,
    required: true,
  },
  subscriptionId: {
    type: String,
  },
  customerId: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);


exports.User = User;