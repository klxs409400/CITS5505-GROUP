document.addEventListener("DOMContentLoaded", function () {
    // Sidebar Toggle
    const sidebarToggle = document.getElementById("sidebarToggle");
    const dashboardWrapper = document.querySelector(".dashboard-wrapper");
  
    sidebarToggle.addEventListener("click", function () {
      dashboardWrapper.classList.toggle("sidebar-collapsed");
    });
  
    // Record Sleep Modal
    const recordSleepLinks = document.querySelectorAll(".record-sleep-link");
    recordSleepLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const recordSleepModal = new bootstrap.Modal(
          document.getElementById("recordSleepModal")
        );
        recordSleepModal.show();
      });
    });
  
    // Sleep Chart
    const sleepChartCtx = document.getElementById("sleepChart").getContext("2d");
    const sleepChart = new Chart(sleepChartCtx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Sleep Duration (hours)",
            data: [7.5, 6.75, 8.25, 6.25, 7.25, 8, 7.5],
            backgroundColor: "rgba(94, 114, 228, 0.1)",
            borderColor: "rgba(94, 114, 228, 1)",
            borderWidth: 2,
            pointBackgroundColor: "rgba(94, 114, 228, 1)",
            pointBorderColor: "#2a2f4a",
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.3,
            fill: true,
          },
          {
            label: "Sleep Goal",
            data: [8, 8, 8, 8, 8, 8, 8],
            borderColor: "rgba(46, 213, 115, 0.6)",
            borderWidth: 2,
            borderDash: [5, 5],
            pointStyle: false,
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
              padding: 15,
              font: {
                size: 12,
              },
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
            max: 12,
            grid: {
              color: "rgba(73, 76, 106, 0.5)",
              drawBorder: true,
              borderDash: [2, 2],
            },
            ticks: {
              color: "#ced4da",
              stepSize: 2,
              font: {
                size: 11,
              },
            },
          },
          x: {
            grid: {
              color: "rgba(73, 76, 106, 0.5)",
              drawBorder: true,
              borderDash: [2, 2],
            },
            ticks: {
              color: "#ced4da",
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });
  
    // Quality Chart
    const qualityChartCtx = document
      .getElementById("qualityChart")
      .getContext("2d");
    const qualityChart = new Chart(qualityChartCtx, {
      type: "doughnut",
      data: {
        labels: ["Excellent", "Good", "Fair", "Poor"],
        datasets: [
          {
            data: [12, 8, 5, 2],
            backgroundColor: [
              "rgba(46, 213, 115, 0.8)",
              "rgba(54, 185, 204, 0.8)",
              "rgba(255, 193, 7, 0.8)",
              "rgba(255, 71, 87, 0.8)",
            ],
            borderColor: [
              "rgba(46, 213, 115, 1)",
              "rgba(54, 185, 204, 1)",
              "rgba(255, 193, 7, 1)",
              "rgba(255, 71, 87, 1)",
            ],
            borderWidth: 1,
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
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(30, 32, 47, 0.9)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
          },
        },
        cutout: "70%",
      },
    });
  });
  