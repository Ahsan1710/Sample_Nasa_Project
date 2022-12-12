const mongoose = require('mongoose');

const planetSchema = new mongoose.Schema({
    keplerName: {
        type: String,
        required: true,
    }
})

//Mongoose model will connect with planets documnet
module.exports = mongoose.model('Planet', planetSchema);