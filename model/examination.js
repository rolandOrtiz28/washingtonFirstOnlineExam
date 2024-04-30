const mongoose = require('mongoose');
const Schema = mongoose.Schema
const Teacher =require('./teacher')

const questionSchema = new Schema({
  question: String,
  choices: [String],
  correctAnswer: String,
  points: { type: Number, default: 1 }
});

const contentSchema = new Schema({
  title: String,
  remark: String,
  questions: [questionSchema]
});

const examSchema = new Schema({
  title: String,
  term: String,
  level: String,
  subject: String,
  author:{
    type: Schema.Types.ObjectId,
    ref:'Teacher'
  },
  contents: [contentSchema],
  isPublished: { type: Boolean, default: false }
});

module.exports = mongoose.model('Exam', examSchema);