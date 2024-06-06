const mongoose = require('mongoose');


async function connect() {
  try {
    await mongoose.connect('mongodb://127.0.0.1/toy_store');
    console.log('Connected to MongoDB Successfully');
  } catch (error) {
    console.log('Error connecting to MongoDB');
  }
}
module.exports = { connect };
