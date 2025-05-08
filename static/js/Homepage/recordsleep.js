/**
 * Sleep Tracker - Record Sleep Page JavaScript
 * Handles form functionality, duration calculation, and form submission
 */

$(document).ready(function () {
  // Set current date as default for sleep date input
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  $("#sleepDate").val(formattedDate);

  // Set default values for time inputs
  $("#sleepTime").val("23:00");
  $("#wakeTime").val("07:00");

  // Set default duration values based on sleep time and wake time
  $("#sleepDurationHours").val("8");
  $("#sleepDurationMinutes").val("0");

  // Calculate sleep duration when sleep time or wake time changes
  $("#sleepTime, #wakeTime").on("change", function () {
    calculateSleepDuration();
  });

  // Form submission validation
  $("#sleepEntryForm").on("submit", function (e) {
    // Basic validation
    const sleepDate = $("#sleepDate").val();
    const sleepTime = $("#sleepTime").val();
    const wakeTime = $("#wakeTime").val();
    const durationHours = parseInt($("#sleepDurationHours").val()) || 0;
    const durationMinutes = parseInt($("#sleepDurationMinutes").val()) || 0;
    const quality = $("#quality").val();
    const mood = $("#mood").val();

    if (!sleepDate || !sleepTime || !wakeTime) {
      e.preventDefault();
      alert("Please fill in all required date and time fields.");
      return false;
    }

    if (durationHours === 0 && durationMinutes === 0) {
      e.preventDefault();
      alert("Sleep duration cannot be zero.");
      return false;
    }

    if (durationHours > 24) {
      e.preventDefault();
      alert("Sleep duration cannot exceed 24 hours.");
      return false;
    }

    if (!quality || !mood) {
      e.preventDefault();
      alert("Please select sleep quality and morning mood.");
      return false;
    }

    // Additional validation for numerical fields
    const caffeine = parseInt($("#caffeine").val());
    const exercise = parseInt($("#exercise").val());
    const screen = parseInt($("#screen").val());
    const eating = parseInt($("#eating").val());
    const sleep_latency = parseInt($("#sleep_latency").val());

    // Ensure numerical values are set correctly
    if (
      isNaN(caffeine) ||
      isNaN(exercise) ||
      isNaN(screen) ||
      isNaN(eating) ||
      isNaN(sleep_latency)
    ) {
      e.preventDefault();
      alert("Please select valid values for all fields.");
      return false;
    }

    // If validation passes, let the form submit
    console.log("Form validation passed, submitting...");
    return true;
  });

  // Calculate initial sleep duration
  calculateSleepDuration();
});

/**
 * Calculate sleep duration based on sleep time and wake time
 * Updates the hours and minutes input fields
 */
function calculateSleepDuration() {
  try {
    const sleepTime = $("#sleepTime").val();
    const wakeTime = $("#wakeTime").val();

    if (sleepTime && wakeTime) {
      // Parse times
      const [sleepHour, sleepMinute] = sleepTime.split(":").map(Number);
      const [wakeHour, wakeMinute] = wakeTime.split(":").map(Number);

      // Calculate duration in minutes
      let durationMinutes =
        wakeHour * 60 + wakeMinute - (sleepHour * 60 + sleepMinute);

      // If wake time is earlier than sleep time, add 24 hours (1440 minutes)
      if (durationMinutes < 0) {
        durationMinutes += 1440;
      }

      // Convert to hours and minutes
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      // Update form fields
      $("#sleepDurationHours").val(hours);
      $("#sleepDurationMinutes").val(minutes);

      console.log(`Calculated duration: ${hours}h ${minutes}m`);
    }
  } catch (error) {
    console.error("Error calculating sleep duration:", error);
  }
}
