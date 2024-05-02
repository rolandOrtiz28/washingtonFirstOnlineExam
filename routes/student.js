const express = require("express");
const router = express.Router();
const catchAsync = require('../utils/CatchAsync')
const Student = require('../model/student')
const Exam = require('../model/examination')

router.get('/registration', async (req, res) => {
    res.render('student/form')
})


router.post('/register', catchAsync(async(req, res)=>{
    await Student.deleteMany({})
const {name, age, gender, level, time} = req.body;
const student = new Student({name, age, gender, level, time})

await student.save();

res.redirect(`/student/show?level=${student.level}`);

})) 


router.get('/show', async (req, res) => {
    try {
      
        const studentLevel = req.query.level; // Assuming level is passed as query parameter
       
        const exams = await Exam.find({ level: studentLevel, isPublished: true });
       
        res.render('student/exams', { exams });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.get('/exam/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        res.render('student/exam', { exam });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});


router.post('/submit-exam', async (req, res) => {
    try {
        // Ensure req.user exists and contains user information
        if (!req.user || !req.user.id) {
            return res.status(401).send('Unauthorized'); // User is not authenticated
        }
        
        const exam = await Exam.findById(req.body.examId);
        if (!exam) {
            return res.status(404).send('Exam not found');
        }
    
        // Check if req.body.answers is an object
        if (typeof req.body.answers !== 'object') {
            return res.status(400).send('Invalid form data'); // Handle invalid form data
        }

        // Calculate score
        let score = 0;
        for (const contentTitle in req.body.answers) {
            const contentAnswers = req.body.answers[contentTitle];
            const content = exam.contents.find(content => content.title === contentTitle);
            if (!content) {
                continue; // Skip if content not found
            }
            content.questions.forEach((question, index) => {
                if (contentAnswers[index] === question.correctAnswer) {
                    score += question.points;
                }
            });
        }
    
        // Update student's record with exam score
        const studentId = req.user.id;
        console.log('Student ID:', studentId);
        await Student.findByIdAndUpdate(studentId, { $push: { examScores: { examId: exam._id, score: score } } });
    
        // Render the exam result template with the calculated score
        res.render('student/score', { score });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router