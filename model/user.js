const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    email:{
        type: String,
        unique:true,
    },
    name: {
        type: String,
        required: function() {
            return this.role === 'student'; // Gender is required only for students
        },
        unique: false,
    },
     level: {
        type: String,
        required: function() {
            return this.role === 'student'; // Gender is required only for students
        },
        unique: false,
    },
    time:{
        type: String,
         required: function() {
            return this.role === 'student'; // Gender is required only for students
        },
        unique: false
    },
    examScores: {
        type: [{ examId: Schema.Types.ObjectId, score: Number }],
        default: [],
        required: function() {
            return this.role === 'student';
        },
    },
    role: {
        type: String,
        enum: ['student', 'teacher'],
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
      },
});

UserSchema.add({
    contentScores: {
        type: Schema.Types.Mixed,
        default: {},
    },
});


UserSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model('User', UserSchema);
