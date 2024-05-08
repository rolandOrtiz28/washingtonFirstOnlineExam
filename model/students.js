const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const StudentsSchema = new Schema({
    email: {
        type: String,
        required: false,
        unique: true
    },
    name: {
        type: String,
        required: false,
        unique: false,
    },
    age: {
        type: Number,
        required: false,
        unique: false,
    },
    gender: {
        type: String,
        required: false,
        unique: false,
    },
    level: {
        type: String,
        required: false,
        unique: false,
    },
    time:{
        type: String,
        required: false,
        unique: false
    },
    examScores: {
        type: [{ examId: Schema.Types.ObjectId, score: Number }],
        default: []
    },

});


StudentsSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model('Students', StudentsSchema);
