const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const StudentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: false,
    },
    age: {
        type: Number,
        required: true,
        unique: false,
    },
    gender: {
        type: String,
        required: true,
        unique: false,
    },
    level: {
        type: String,
        required: true,
        unique: false,
    },
    time:{
        type: String,
        required: true,
        unique: false
    }


}, { timestamps: true })


module.exports = mongoose.model('Student', StudentSchema);