function initializeExam() {
    // Function to reset audio play count on page refresh
    function resetAudioPlayCount() {
        // Iterate over all audio elements
        document.querySelectorAll('audio').forEach(function(audio) {
            var contentIndex = audio.getAttribute('data-content-index');
            var audioPlayCountKey = 'audioPlayCount_' + contentIndex;
            // Reset play count to 0
            localStorage.setItem(audioPlayCountKey, 0);
        });
    }

    // Call resetAudioPlayCount when the page is loaded or refreshed
    window.addEventListener('load', resetAudioPlayCount);

    // Function to hide audio after it has been played three times
    function hideAudio(audioId) {
        var audio = document.getElementById(audioId);
        var contentIndex = audio.getAttribute('data-content-index');
        var audioPlayCountKey = 'audioPlayCount_' + contentIndex;
        var audioPlayCount = parseInt(localStorage.getItem(audioPlayCountKey)) || 0;

        // Increment the play count
        audioPlayCount++;
        localStorage.setItem(audioPlayCountKey, audioPlayCount);

        // If played three times, hide the audio
        if (audioPlayCount >= 3) {
            audio.style.display = 'none';
            document.querySelector('#' + audioId + ' + button').style.display = 'none';
        }
    }

    // Attach event listeners to audio elements
    document.querySelectorAll('audio').forEach(function(audio) {
        audio.addEventListener('play', function() {
            var contentIndex = audio.getAttribute('data-content-index');
            var audioPlayCountKey = 'audioPlayCount_' + contentIndex;
            var audioPlayCount = parseInt(localStorage.getItem(audioPlayCountKey)) || 0;

            // If played three times, prevent further play
            if (audioPlayCount >= 3) {
                audio.pause();
            }
        });
    });
}

// Call the initializeExam function when the page is loaded
window.addEventListener('load', initializeExam);




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