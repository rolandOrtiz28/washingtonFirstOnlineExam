 document.getElementById('addContent').addEventListener('click', () => {
            const contentCount = document.querySelectorAll('.content').length;

            const emptyContent = document.createElement('div');
            emptyContent.classList.add('content');
            emptyContent.innerHTML = `
            <div class="row">
                  <div class="col">
                <div data-mdb-input-init class="form-outline">
                    <select class="form-select mb-2" name="contents[${contentCount}][type]" required>
                        <option value="" selected disabled>Select Content Type</option>
                        <option value="Listening">Listening</option>
                        <option value="Vocabulary">Vocabulary</option>
                        <option value="Grammar">Grammar</option>
                        <option value="Reading">Reading</option>
                    </select>
                </div>
              <div class="form-outline mb-2" id="audioField_${contentCount}" style="display: none;">
                                <input type="file" class="form-control mb-2" name="contents[${contentCount}][audio]" required>
                            </div>
                <div class="form-outline mb-2" id="storyField_${contentCount}" style="display: none;">
                    <textarea class="form-control mb-2" name="contents[${contentCount}][story]" placeholder="Story"></textarea>
                </div>
            </div>
                <div class="col-md-2">
                    <input type="text" class="form-control mb-2" name="contents[${contentCount}][remark]" placeholder="Content Remark">
                </div>
            </div>

            <div class="questions">
                <div class="question mb-2">
                    <input type="text" class="form-control mb-2" name="contents[${contentCount}][questions][0][question]" placeholder="Question" required>
                    <input type="text" class="form-control mb-2" name="contents[${contentCount}][questions][0][choices][0]" placeholder="Choice 1" required>
                    <input type="text" class="form-control mb-2" name="contents[${contentCount}][questions][0][choices][1]" placeholder="Choice 2" required>
                    <input type="text" class="form-control mb-2" name="contents[${contentCount}][questions][0][choices][2]" placeholder="Choice 3" required>
                    <input type="text" class="form-control mb-2" name="contents[${contentCount}][questions][0][correctAnswer]" placeholder="Correct Answer" required>
                    <input type="number" class="form-control mb-2" name="contents[${contentCount}][questions][0][points]" placeholder="Points" required>
                </div>
            </div>
            <button type="button" class="addQuestion btn btn-primary">Add Question</button>
        `;
            document.getElementById('contents').appendChild(emptyContent);
        });

        document.addEventListener('click', function (event) {
            if (event.target.classList.contains('addQuestion')) {
                const questionContainer = event.target.parentNode.querySelector('.questions');
                const contentIndex = Array.from(questionContainer.parentNode.parentNode.children).indexOf(questionContainer.parentNode);
                const questionCount = questionContainer.querySelectorAll('.question').length;
                const newQuestion = document.createElement('div');
                newQuestion.classList.add('question');
                newQuestion.innerHTML = `
                <input type="text" class="form-control mb-2" name="contents[${contentIndex}][questions][${questionCount}][question]" placeholder="Question" required>
                <input type="text" class="form-control mb-2" name="contents[${contentIndex}][questions][${questionCount}][choices][0]" placeholder="Choice 1" required>
                <input type="text" class="form-control mb-2" name="contents[${contentIndex}][questions][${questionCount}][choices][1]" placeholder="Choice 2" required>
                <input type="text" class="form-control mb-2" name="contents[${contentIndex}][questions][${questionCount}][choices][2]" placeholder="Choice 3" required>
                <input type="text" class="form-control mb-2" name="contents[${contentIndex}][questions][${questionCount}][correctAnswer]" placeholder="Correct Answer" required>
                <input type="number" class="form-control mb-2" name="contents[${contentIndex}][questions][${questionCount}][points]" placeholder="Points" required>
            `;
                questionContainer.appendChild(newQuestion);
            }
        });

        document.addEventListener('change', function (event) {
            if (event.target.name.startsWith('contents[') && event.target.name.endsWith('][type]')) {
                const contentIndex = event.target.name.match(/\[(\d+)\]/)[1];
                const audioField = document.getElementById(`audioField_${contentIndex}`);
                const storyField = document.getElementById(`storyField_${contentIndex}`);
                if (event.target.value === 'Listening') {
                    audioField.style.display = 'block';
                    storyField.style.display = 'none';
                } else if (event.target.value === 'Reading') {
                    audioField.style.display = 'none';
                    storyField.style.display = 'block';
                } else {
                    audioField.style.display = 'none';
                    storyField.style.display = 'none';
                }
            }
        });