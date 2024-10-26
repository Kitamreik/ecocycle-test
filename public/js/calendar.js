// // calendar.js
//
// document.addEventListener('DOMContentLoaded', function() {
//     // These variables will be set by the EJS template
//     let currentMonth;
//     let currentYear;
//
//     // Function to initialize the calendar
//     window.initCalendar = function(month, year) {
//         currentMonth = month;
//         currentYear = year;
//     }
//
//     // Function to change the month
//     window.changeMonth = function(offset) {
//         currentMonth += offset;
//         if (currentMonth < 0) {
//             currentMonth = 11;
//             currentYear -= 1;
//         } else if (currentMonth > 11) {
//             currentMonth = 0;
//             currentYear += 1;
//         }
//
//         // Redirect to update the calendar view with the new month and year
//         window.location.href = `/api/calendar?month=${currentMonth}&year=${currentYear}`;
//     }
// });