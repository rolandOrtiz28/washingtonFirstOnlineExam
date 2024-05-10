const mongoose = require('mongoose');
const Schema = mongoose.Schema
const Teacher =require('./teacher')
const User =require('./user')

const questionSchema = new Schema({
  question: String,
  choices: [String],
  correctAnswer: String,
  points: { type: Number, default: 1 }
});

const contentSchema = new Schema({
  title: String,
  instruction: String,
  type: { type: String, enum: ['Listening', 'Vocabulary', 'Grammar', 'Reading'] },
  remark: String,
  audio: String, // For storing the audio URL if type is Listening
  story: String, // For storing the story if type is Reading
  questions: [questionSchema]
});

const examSchema = new Schema({
  title: String,
  term: String,
  level: String,
  subject: String,
  time: String,
  author:{
    type: Schema.Types.ObjectId,
    ref:'User'
  },
  contents: [contentSchema],
  isPublished: { type: Boolean, default: false }
});

module.exports = mongoose.model('Exam', examSchema);