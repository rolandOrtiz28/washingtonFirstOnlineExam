document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.querySelector('.container-md');

    contentContainer.addEventListener('click', (event) => {
        if (event.target.matches('.add-content')) {
            const contents = document.querySelectorAll('.content');
            const newContentIndex = contents.length;
            const newContent = document.createElement('div');
            newContent.classList.add('content', 'mb-4');
            newContent.innerHTML = `
                <div class="row">
                    <div class="col">
                        <div data-mdb-input-init class="form-outline">
                            <select class="form-select mb-2" name="contents[${newContentIndex}][type]" required>
                                <option value="" disabled selected>Select Content Type</option>
                                <option value="Listening">Listening</option>
                                <option value="Vocabulary">Vocabulary</option>
                                <option value="Grammar">Grammar</option>
                                <option value="Reading">Reading</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="questions" id="questions_${newContentIndex}">
                    <h3>Questions</h3>
                    <button type="button" class="btn btn-secondary add-question" data-content-index="${newContentIndex}">Add Question</button>
                </div>
                <button type="button" class="btn btn-danger btn-sm remove-content">Remove Content</button>
            `;
            contentContainer.insertBefore(newContent, event.target);
        } else if (event.target.matches('.remove-content')) {
            event.target.closest('.content').remove();
        } else if (event.target.matches('.add-question')) {
            const contentIndex = event.target.getAttribute('data-content-index');
            const questionsContainer = document.getElementById(`questions_${contentIndex}`);
            const questions = questionsContainer.querySelectorAll('.question');
            const newQuestionIndex = questions.length;
            const newQuestion = document.createElement('div');
            newQuestion.classList.add('question', 'mb-3');
            newQuestion.innerHTML = `
                <div class="form-outline mb-2">
                    <input type="text" class="form-control" name="contents[${contentIndex}][questions][${newQuestionIndex}][question]" placeholder="Question" required>
                </div>
                <div class="choices">
                    <div class="form-outline mb-2">
                        <input type="text" class="form-control" name="contents[${contentIndex}][questions][${newQuestionIndex}][choices][0]" placeholder="Choice 1" required>
                    </div>
                    <div class="form-outline mb-2">
                        <input type="text" class="form-control" name="contents[${contentIndex}][questions][${newQuestionIndex}][choices][1]" placeholder="Choice 2" required>
                    </div>
                    <div class="form-outline mb-2">
                        <input type="text" class="form-control" name="contents[${contentIndex}][questions][${newQuestionIndex}][choices][2]" placeholder="Choice 3" required>
                    </div>
                    <div class="form-outline mb-2">
                        <input type="text" class="form-control" name="contents[${contentIndex}][questions][${newQuestionIndex}][choices][3]" placeholder="Choice 4" required>
                    </div>
                </div>
                <div class="form-outline mb-2">
                    <input type="text" class="form-control" name="contents[${contentIndex}][questions][${newQuestionIndex}][answer]" placeholder="Answer" required>
                </div>
                <div class="form-outline mb-2">
                    <input type="number" class="form-control mb-2" name="contents[${contentIndex}][questions][${newQuestionIndex}][points]" placeholder="Points" required>
                </div>
                <button type="button" class="btn btn-danger btn-sm remove-question">Remove Question</button>
            `;
            questionsContainer.insertBefore(newQuestion, event.target);
        } else if (event.target.matches('.remove-question')) {
            event.target.closest('.question').remove();
        }
    });
});
