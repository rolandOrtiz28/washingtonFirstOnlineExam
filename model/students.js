const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const StudentsSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },name: {
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
    },
 examScores: {
        type: [{ examId: Schema.Types.ObjectId, score: Number }],
        default: []
    },
 role: {
        type: String,
        default: 'student'
    }
});


StudentsSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model('Students', StudentsSchema);
