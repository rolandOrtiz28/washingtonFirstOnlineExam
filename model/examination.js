const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  choices: [String],
  correctAnswer: String,
  points: { type: Number, default: 1 }
});

const contentSchema = new mongoose.Schema({
  title: String,
  remark: String,
  questions: [questionSchema]
});

const examSchema = new mongoose.Schema({
  title: String,
  term: String,
  level: String,
  subject: String,
  contents: [contentSchema],
  isPublished: { type: Boolean, default: false }
});

module.exports = mongoose.model('Exam', examSchema);