$(document).ready(function () {
  console.log("Dashboard.js loaded"); // Debug info

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

  // Sleep Trend Chart
  const sleepTrendChart = document
    .getElementById("sleepTrendChart")
    .getContext("2d");

  const sleepTrendData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sleep Duration",
        data: [7.5, 6.5, 7.5, 6, 8.5, 7.5, 7.5],
        backgroundColor: "rgba(94, 114, 228, 0.2)",
        borderColor: "rgba(94, 114, 228, 1)",
        borderWidth: 2,
        pointRadius: 5,
        pointBackgroundColor: "rgba(94, 114, 228, 1)",
        pointBorderColor: "#fff",
        tension: 0.3,
      },
      {
        label: "Sleep Goal",
        data: [8, 8, 8, 8, 8, 8, 8],
        borderColor: "rgba(46, 203, 186, 0.8)",
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const sleepTrendConfig = {
    type: "line",
    data: sleepTrendData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#f8f9fa",
            font: {
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(45, 45, 45, 0.9)",
          titleColor: "#f8f9fa",
          bodyColor: "#f8f9fa",
          borderColor: "#424242",
          borderWidth: 1,
          padding: 12,
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(66, 66, 66, 0.5)",
            borderColor: "#424242",
            borderDash: [2, 2],
          },
          ticks: {
            color: "#adb5bd",
            font: {
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              size: 11,
            },
          },
        },
        y: {
          beginAtZero: true,
          max: 12,
          grid: {
            color: "rgba(66, 66, 66, 0.5)",
            borderColor: "#424242",
            borderDash: [2, 2],
          },
          ticks: {
            color: "#adb5bd",
            font: {
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              size: 11,
            },
            stepSize: 2,
          },
        },
      },
    },
  };

  new Chart(sleepTrendChart, sleepTrendConfig);

  // Sleep Quality Chart
  const sleepQualityChart = document
    .getElementById("sleepQualityChart")
    .getContext("2d");

  const sleepQualityData = {
    labels: ["Excellent", "Good", "Fair", "Poor"],
    datasets: [
      {
        data: [8, 12, 3, 2],
        backgroundColor: [
          "rgba(46, 209, 151, 0.8)",
          "rgba(54, 195, 216, 0.8)",
          "rgba(255, 193, 7, 0.8)",
          "rgba(255, 71, 87, 0.8)",
        ],
        borderColor: [
          "rgba(46, 209, 151, 1)",
          "rgba(54, 195, 216, 1)",
          "rgba(255, 193, 7, 1)",
          "rgba(255, 71, 87, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const sleepQualityConfig = {
    type: "doughnut",
    data: sleepQualityData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#f8f9fa",
            font: {
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              size: 11,
            },
            boxWidth: 12,
            padding: 15,
          },
        },
        tooltip: {
          backgroundColor: "rgba(45, 45, 45, 0.9)",
          titleColor: "#f8f9fa",
          bodyColor: "#f8f9fa",
          borderColor: "#424242",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce(
                (acc, data) => acc + data,
                0
              );
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${percentage}% (${value} nights)`;
            },
          },
        },
      },
      cutout: "70%",
    },
  };

  new Chart(sleepQualityChart, sleepQualityConfig);

  // Update Sleep Goal handler
  $("#saveGoalBtn").click(function () {
    console.log("Save goal button clicked"); // Debug info
    const sleepGoalHours = parseFloat($("#sleepGoalHours").val());
    const sleepGoalMinutes = parseInt($("#sleepGoalMinutes").val());

    if (isNaN(sleepGoalHours) || isNaN(sleepGoalMinutes)) {
      alert("Please enter valid numbers for sleep goal");
      return;
    }

    // Calculate total hours
    const totalHours = sleepGoalHours + sleepGoalMinutes / 60;

    // In a real implementation, this would update a database
    // For now, we'll just show a success message
    showToast(
      "Sleep goal updated successfully! Your goal is now " +
        totalHours.toFixed(1) +
        " hours",
      "success"
    );

    // Update goal line in chart
    updateChartGoalLine(totalHours);

    // Close the modal
    $("#sleepGoalModal").modal("hide");
  });

  // Function to update the goal line in the chart
  function updateChartGoalLine(goalHours) {
    const chart = Chart.getChart("sleepTrendChart");
    if (chart) {
      // Update the second dataset (goal line)
      chart.data.datasets[1].data = Array(7).fill(goalHours);
      chart.update();
    }
  }

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
