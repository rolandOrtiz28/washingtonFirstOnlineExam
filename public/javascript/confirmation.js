
      
      // Get the current date
      var currentDate = new Date();
      
      // Convert month number to month name
      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var monthName = months[currentDate.getMonth()];
      
      // Add "th" to the day
      var day = currentDate.getDate();
      var dayWithSuffix = day + (day % 10 == 1 && day != 11 ? 'st' : (day % 10 == 2 && day != 12 ? 'nd' : (day % 10 == 3 && day != 13 ? 'rd' : 'th')));
      
      // Format the date as desired (e.g., "May 25th, YYYY")
      var formattedDate = dayWithSuffix + ' ' +monthName+ ', ' + currentDate.getFullYear(); // Adjust the format as needed
      
      // Display the formatted date in the designated element
      document.getElementById("currentDate").textContent = formattedDate;