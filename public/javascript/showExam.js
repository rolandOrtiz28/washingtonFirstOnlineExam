document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('audio').forEach(audio => {
        let playCount = 0;

        audio.addEventListener('play', () => {
            playCount++;
            if (playCount >= 2) {
                audio.onplay = function() {
                    audio.pause();
                    audio.currentTime = 0;
                };
                audio.controls = false;
                alert('You have reached the maximum play limit for this audio.');
            }
        });
    });
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