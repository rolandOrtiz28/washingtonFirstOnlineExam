const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/CatchAsync')
const Student = require('../model/student')

router.get('/registration', async (req, res) => {
    res.render('student/form')
})


router.post('/register', catchAsync(async(req, res)=>{
    await Student.deleteMany({})
const {name, age, gender, level, time} = req.body;
const student = new Student({name, age, gender, level, time})
console.log(student)
await student.save();

res.redirect('/')

}))

module.exports = router