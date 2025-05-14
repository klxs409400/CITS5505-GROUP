$(document).ready(function () {
  // Toggle sidebar
  $("#sidebarToggle").click(function () {
    $(".wrapper").toggleClass("sidebar-collapsed");
  });

  // Create chart data for demo
  const sleepTrendCtx = document
    .getElementById("sleepTrendChart")
    .getContext("2d");
  const sleepTrendChart = new Chart(sleepTrendCtx, {
    type: "line",
    data: {
      labels: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      datasets: [
        {
          label: "Sleep Duration",
          data: [7.5, 6.75, 8.25, 6, 7.25, 8, 7.5],
          backgroundColor: "rgba(94, 114, 228, 0.1)",
          borderColor: "rgba(94, 114, 228, 1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        {
          label: "Sleep Goal",
          data: [8, 8, 8, 8, 8, 8, 8],
          borderColor: "rgba(46, 209, 151, 0.6)",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#ced4da",
          },
        },
        tooltip: {
          backgroundColor: "rgba(30, 32, 47, 0.9)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          callbacks: {
            label: function (context) {
              return context.dataset.label + ": " + context.raw + " hours";
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          grid: {
            color: "rgba(73, 76, 106, 0.5)",
            borderDash: [2, 2],
          },
          ticks: {
            color: "#ced4da",
            stepSize: 2,
          },
        },
        x: {
          grid: {
            color: "rgba(73, 76, 106, 0.5)",
            borderDash: [2, 2],
          },
          ticks: {
            color: "#ced4da",
          },
        },
      },
    },
  });

  // Add the following code to specifically handle edit and delete buttons
  $(".edit-btn, .delete-btn").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Prevent event bubbling

    // Determine which type of button was clicked
    const buttonType = $(this).hasClass("edit-btn") ? "Edit" : "Delete";

    // Display a notification message
    toastMessage(
      `This is demo mode, ${buttonType} functionality is not available.`
    );

    return false; // Ensure no navigation is triggered
  });

  // Handle delete confirmation form submission
  $("#deleteEntryForm").on("submit", function (e) {
    e.preventDefault(); // Prevent form submission

    // Hide the modal
    const deleteModal = bootstrap.Modal.getInstance(
      document.getElementById("deleteConfirmModal")
    );
    if (deleteModal) {
      deleteModal.hide();
    }

    // Display notification message
    toastMessage("Delete functionality is not available in demo mode.");

    return false; // Ensure form is not submitted
  });

  // Modify confirm delete button behavior
  $("#confirmDeleteBtn").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Prevent event bubbling

    // Hide the modal
    const deleteModal = bootstrap.Modal.getInstance(
      document.getElementById("deleteConfirmModal")
    );
    if (deleteModal) {
      deleteModal.hide();
    }

    // Display notification message
    toastMessage("Delete functionality is not available in demo mode.");

    return false; // Ensure no navigation is triggered
  });
  // Sleep Quality Chart
  const sleepQualityCtx = document
    .getElementById("sleepQualityChart")
    .getContext("2d");
  const sleepQualityChart = new Chart(sleepQualityCtx, {
    type: "doughnut",
    data: {
      labels: ["Excellent", "Good", "Fair", "Poor"],
      datasets: [
        {
          data: [12, 8, 5, 2],
          backgroundColor: [
            "#2ed197", // Success
            "#36c3d8", // Info
            "#ffc107", // Warning
            "#ff4757", // Danger
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#ced4da",
            padding: 15,
          },
        },
      },
      cutout: "70%",
    },
  });

  // Add demo mode behavior - disable all interactive elements
  $("button, a.btn, a.dropdown-item").on("click", function (e) {
    if (
      !$(this).hasClass("navbar-toggler") &&
      !$(this).attr("data-bs-dismiss")
    ) {
      e.preventDefault();
      // Show message for non-functional buttons
      toastMessage("This functionality is not available in demo mode.");
    }
  });

  // Demo mode toast message
  function toastMessage(message) {
    // Create toast container if it doesn't exist
    if ($("#toastContainer").length === 0) {
      $("body").append(
        '<div id="toastContainer" style="position: fixed; bottom: 20px; right: 20px; z-index: 1100;"></div>'
      );
    }

    // Create toast
    const toastId = "toast-" + Date.now();
    const toast = `
  <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000" style="background-color: #d9edf7;">
    <div class="toast-header" style="background-color: #bce8f1; border-bottom: 1px solid #bce8f1;">
      <i class="fas fa-info-circle text-primary me-2"></i>
      <strong class="me-auto" style="color: #31708f !important; font-weight: bold;">Demo Mode</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body" style="color: #31708f; font-weight: 500;">
      ${message}
    </div>
  </div>
`;

    // Add and show toast
    $("#toastContainer").append(toast);
    const toastElement = new bootstrap.Toast(document.getElementById(toastId));
    toastElement.show();
  }
});
