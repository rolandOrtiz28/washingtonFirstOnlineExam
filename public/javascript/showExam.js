var contentIndex = document.getElementById('contentIndex').value;

    document.getElementById('audio_' + contentIndex).addEventListener('play', function() {
        var playCount = parseInt(localStorage.getItem('playCount_' + contentIndex)) || 0;
        if (playCount < 2) {
            localStorage.setItem('playCount_' + contentIndex, playCount + 1);
        } else {
            this.style.display = 'none'; // Hide the audio element
        }
    });



    window.onload = function () {
        var contentIndex = document.getElementById('contentIndex').value;
        if (!localStorage.getItem('playCount_' + contentIndex)) {
            localStorage.setItem('playCount_' + contentIndex, 0);
        }

        // Timer function
        var timer = document.getElementById('timer');
        var examForm = document.getElementById('examForm');
        var timeLimit = 3600; // 1 hour in seconds

        var startTime = Date.now();
        var endTime = startTime + (timeLimit * 1000); // Convert to milliseconds

        function updateTimer() {
            var remainingTime = Math.max(0, endTime - Date.now());
            var minutes = Math.floor(remainingTime / (60 * 1000));
            var seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

            timer.textContent = 'Time Remaining: ' + minutes + 'm ' + seconds + 's';

            // If time's up, submit the exam
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                examForm.submit();
            }
        }

        updateTimer(); // Initial call to update timer

        // Update the timer every second
        var timerInterval = setInterval(updateTimer, 1000);
        window.addEventListener('scroll', function () {
            if (timer.getBoundingClientRect().top <= 20) { // Adjust this value as needed
                timer.classList.add('sticky-timer');
            } else {
                timer.classList.remove('sticky-timer');
            }
        });
    };