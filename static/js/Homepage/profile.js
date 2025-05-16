$(document).ready(function () {
  console.log("Profile.js loaded successfully"); // Debugging line

  // Sidebar toggle functionality
  $("#sidebarToggle").on("click", function () {
    console.log("Sidebar toggle clicked"); // Debugging line
    $(".sidebar").toggleClass("active");

    if ($(".sidebar").hasClass("active")) {
      // When the active class is added to sidebar
      $(".main-content").css({
        "margin-left": "0",
        width: "100%",
      });
    } else {
      // When the active class is removed from sidebar
      $(".main-content").css({
        "margin-left": "280px",
        width: "calc(100% - 280px)",
      });
    }
  });

  // Profile form submission handler
  $("#editProfileForm").on("submit", function (e) {
    // Form already has action and method for server-side submission,
    // but we can add client-side validation here
    let form = this;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      form.classList.add("was-validated");
      return false;
    }

    // Display a loading indicator if desired
    showToast("Updating profile...", "info");

    // Let the form submit naturally - no need to prevent default
    // The server will handle the submission and redirect
    return true;
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

  // Initialize tooltips
  try {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  } catch (e) {
    console.error("Error initializing tooltips:", e);
  }

  // Display flash messages as toasts if they exist
  if (typeof flashes !== "undefined" && flashes.length > 0) {
    flashes.forEach((flash) => {
      showToast(flash.message, flash.category);
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

  // Refresh page when returning from other pages to ensure stats are up-to-date
  // This helps when a user adds a sleep record and then views profile
  if (performance && performance.navigation) {
    // Check if page was reloaded via back/forward button
    if (performance.navigation.type === 2) {
      // 2 is TYPE_BACK_FORWARD
      location.reload();
    }
  }

  // Alternative method for modern browsers
  if (window.navigation && window.navigation.type === "back_forward") {
    location.reload();
  }

  // Check for achievements on profile page load
  $.ajax({
    url: "/check-achievements",
    type: "GET",
    success: function (response) {
      if (response.success) {
        console.log("Achievements checked successfully");

        // Optionally refresh achievements display if needed
        // You could add an AJAX call to get the latest achievements
        // or simply reload the page if any new achievements were unlocked
      } else {
        console.error("Error checking achievements:", response.error);
      }
    },
    error: function (xhr, status, error) {
      console.error("AJAX error checking achievements:", error);
    },
  });

  // Style the achievement cards
  $(".badge-card").each(function () {
    // Add hover effects
    $(this).hover(
      function () {
        $(this).css({
          transform: "translateY(-5px)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "box-shadow": "0 10px 20px rgba(0, 0, 0, 0.2)",
        });
      },
      function () {
        $(this).css({
          transform: "translateY(0)",
          "box-shadow": $(this).find(".badge-icon").hasClass("locked")
            ? "none"
            : "0 0 10px rgba(78, 115, 223, 0.2)",
        });
      }
    );

    // Apply different styling based on locked status
    if ($(this).find(".badge-icon").hasClass("locked")) {
      $(this).css({
        opacity: "0.7",
        "background-color": "#f8f9fc",
        "border-color": "#e3e6f0",
      });
      $(this).find(".badge-icon").css({
        "background-color": "#858796",
        color: "#f8f9fc",
      });
    } else {
      $(this).css({
        "border-color": "#4e73df",
        "box-shadow": "0 0 10px rgba(78, 115, 223, 0.2)",
      });

      // Apply specific color to unlocked achievement icons based on type
      const icon = $(this).find(".badge-icon i");
      if (icon.hasClass("fa-star")) icon.css("color", "#f6c23e");
      if (icon.hasClass("fa-moon")) icon.css("color", "#36b9cc");
      if (icon.hasClass("fa-bed")) icon.css("color", "#1cc88a");
      if (icon.hasClass("fa-owl")) icon.css("color", "#4e73df");
      if (icon.hasClass("fa-crown")) icon.css("color", "#f6c23e");
      if (icon.hasClass("fa-running")) icon.css("color", "#e74a3b");
    }
  });
});
