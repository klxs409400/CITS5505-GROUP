/**
 * Sleep Tracker - Simple Record Sleep Page JavaScript
 * Handles form functionality and duration calculation
 */

$(document).ready(function () {
  // Initialize page with current date
  initializePage();

  // Calculate sleep duration when times change
  $("#sleepTime, #wakeTime").change(function () {
    calculateDuration();
  });

  // Form submission
  $("#sleepEntryForm").submit(function (e) {
    e.preventDefault();
    if (validateForm()) {
      saveRecord();
    }
  });
});

/**
 * Initialize page with current date
 */
function initializePage() {
  const today = new Date();
  const formattedDate = formatDate(today);
  $("#sleepDate").val(formattedDate);
}

/**
 * Format a date object to YYYY-MM-DD for the date input
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Calculate sleep duration based on sleep and wake times
 */
function calculateDuration() {
  const sleepTime = $("#sleepTime").val();
  const wakeTime = $("#wakeTime").val();

  if (sleepTime && wakeTime) {
    // Create date objects for calculation
    // We use the same date for both to simplify calculation
    const sleepDate = new Date(`2023-01-01T${sleepTime}:00`);
    let wakeDate = new Date(`2023-01-01T${wakeTime}:00`);

    // If wake time is earlier than sleep time, assume next day
    if (wakeDate < sleepDate) {
      wakeDate = new Date(`2023-01-02T${wakeTime}:00`);
    }

    // Calculate difference in milliseconds
    const diff = wakeDate - sleepDate;

    // Convert to hours and minutes
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Format the duration
    const duration = `${hours}h ${minutes}m`;

    // Set the duration field
    $("#sleepDuration").val(duration);
  } else {
    $("#sleepDuration").val("");
  }
}

/**
 * Validate form data
 */
function validateForm() {
  let isValid = true;

  // Check required fields
  if (!$("#sleepDate").val()) {
    alert("Please select a sleep date");
    isValid = false;
  }

  if (!$("#sleepTime").val()) {
    alert("Please enter your bedtime");
    isValid = false;
  }

  if (!$("#wakeTime").val()) {
    alert("Please enter your wake-up time");
    isValid = false;
  }

  return isValid;
}

/**
 * Save sleep record
 * In a real application, this would send data to a server
 */
function saveRecord() {
  // For demonstration, we'll just show an alert
  alert("Sleep record saved successfully!");

  // Reset form fields except date
  $("#sleepTime").val("");
  $("#wakeTime").val("");
  $("#sleepDuration").val("");

  // Reset radio buttons to default values
  $("#disturbancesNone").prop("checked", true);
  $("#aidNone").prop("checked", true);
  $("#dysfunctionNone").prop("checked", true);
}
