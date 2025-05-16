$(document).ready(function () {
  console.log("Dashboard.js loaded"); // Debug info

  console.log("Checking Sleep Quality circles:", {
    excellent: $(".quality-circle.excellent .inner-circle span").text(),
    good: $(".quality-circle.good .inner-circle span").text(),
    fair: $(".quality-circle.fair .inner-circle span").text(),
    poor: $(".quality-circle.poor .inner-circle span").text(),
  });

  // Sidebar toggle - simplified to match behavior in image 3
  $("#sidebarToggle").on("click", function () {
    console.log("Sidebar toggle clicked"); // Debug info
    $(".sidebar").toggleClass("active");

    if ($(".sidebar").hasClass("active")) {
      // When sidebar is collapsed
      $(".main-content").css({
        "margin-left": "0",
        width: "100%",
      });
    } else {
      // When sidebar is expanded
      $(".main-content").css({
        "margin-left": "280px",
        width: "calc(100% - 280px)",
      });
    }
  });

  // Set default values for sleep goal form
  const hoursSelect = document.getElementById("sleepGoalHours");
  const minutesSelect = document.getElementById("sleepGoalMinutes");

  if (hoursSelect && minutesSelect) {
    // Set default values if elements exist
    hoursSelect.value = "8";
    minutesSelect.value = "0";

    // Ensure dropdown menus can be clicked and handle user selection
    hoursSelect.addEventListener("change", function () {
      console.log("Dashboard - Selected hours:", hoursSelect.value);
    });

    minutesSelect.addEventListener("change", function () {
      console.log("Dashboard - Selected minutes:", minutesSelect.value);
    });
  }

  // Update Sleep Goal handler - using class-based selector for broader compatibility
  $("#saveGoalBtn").click(function (event) {
    console.log("Save goal button clicked");

    // Get values safely with appropriate fallbacks
    const sleepGoalHours = parseFloat($("#sleepGoalHours").val() || "8");
    const sleepGoalMinutes = parseInt($("#sleepGoalMinutes").val() || "0");

    if (isNaN(sleepGoalHours) || isNaN(sleepGoalMinutes)) {
      alert("Please enter valid numbers for sleep goal");
      event.preventDefault();
      return;
    }

    // Calculate total hours
    const totalHours = sleepGoalHours + sleepGoalMinutes / 60;

    // Show success message
    showToast(
      "Sleep goal updated successfully! Your goal is now " +
        totalHours.toFixed(1) +
        " hours. Refreshing...",
      "success"
    );

    // Close the modal
    $("#sleepGoalModal").modal("hide");

    setTimeout(function () {
      $("#sleepGoalForm").submit();
    }, 500); // 0.5sec
  });

  // Function to display toast notifications
  function showToast(message, type = "info") {
    // Create toast container if it doesn't exist
    if ($("#toastContainer").length === 0) {
      $("body").append(
        '<div id="toastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1100;"></div>'
      );
    }

    // Create a unique ID for the toast
    const toastId = "toast-" + Date.now();

    // Set appropriate background class based on type
    let bgClass = "bg-primary";
    if (type === "success") bgClass = "bg-success";
    if (type === "warning") bgClass = "bg-warning";
    if (type === "error") bgClass = "bg-danger";

    // Create toast HTML structure
    const toast = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} text-white border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

    // Add toast to container
    $("#toastContainer").append(toast);

    // Initialize and show toast
    const toastElement = new bootstrap.Toast(document.getElementById(toastId), {
      delay: 3000,
      animation: true,
    });
    toastElement.show();

    // Remove toast from DOM after it's hidden
    $(`#${toastId}`).on("hidden.bs.toast", function () {
      $(this).remove();
    });
  }

  // Setup for mobile/responsive view
  if ($(window).width() <= 992) {
    // On mobile/tablet, initially hide sidebar
    $(".sidebar").addClass("active");
    $(".main-content").css({
      "margin-left": "0",
      width: "100%",
    });
  }
});
