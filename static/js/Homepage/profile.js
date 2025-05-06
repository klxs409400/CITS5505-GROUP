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

  // Update profile button click handler
  $("#updateProfileBtn").click(function () {
    // Form validation
    let form = $("#editProfileForm")[0];
    if (form.checkValidity() === false) {
      form.classList.add("was-validated");
      return;
    }

    // In a real app, this would send data to the server
    // For now, just show a success message
    showToast("Profile updated successfully!", "success");

    // Close the modal
    $("#editProfileModal").modal("hide");
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
