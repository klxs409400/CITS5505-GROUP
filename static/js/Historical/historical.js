$(document).ready(function () {
  // Debug code to confirm canvas element exists
  console.log("Canvas element exists:", $("#weeklyChart").length > 0);

  // Initialize DataTables
  var sleepTable = $("#sleepHistoryTable").DataTable({
    responsive: true,
    order: [[0, "desc"]], // Sort by date descending by default
    language: {
      search: "_INPUT_",
      searchPlaceholder: "Search records...",
      lengthMenu: "Show _MENU_ entries per page",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "Showing 0 to 0 of 0 entries",
      infoFiltered: "(filtered from _MAX_ total entries)",
    },
    // Custom rendering for certain columns
    columnDefs: [
      {
        targets: 4, // Sleep quality column
        className: "dt-body-center",
      },
      {
        targets: 5, // Morning mood column
        className: "dt-body-center",
      },
      {
        targets: 7, // Actions column
        orderable: false,
        searchable: false,
        className: "dt-body-center",
      },
    ],
    dom: '<"d-flex justify-content-between align-items-center mb-3"<"d-flex align-items-center"l><"d-flex"f>>t<"d-flex justify-content-between align-items-center mt-3"<"d-flex"i><"d-flex"p>>',
  });

  // Ensure canvas has correct dimensions
  $("#weeklyChart").css({
    width: "100%",
    height: "300px",
  });

  // Initialize weekly chart
  const weeklyChartCtx = document
    .getElementById("weeklyChart")
    .getContext("2d");
  console.log("Chart context:", weeklyChartCtx); // Debug info

  // Clear any existing chart
  if (Chart.getChart("weeklyChart")) {
    Chart.getChart("weeklyChart").destroy();
  }

  const weeklyChart = new Chart(weeklyChartCtx, {
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
          label: "Sleep Duration (hours)",
          data: [7.5, 6.5, 7.5, 6, 8.5, 7.5, 7.5], // Initial data
          backgroundColor: "rgba(78, 115, 223, 0.2)",
          borderColor: "rgba(78, 115, 223, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(78, 115, 223, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(78, 115, 223, 1)",
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
        },
        {
          label: "Sleep Goal",
          data: [8, 8, 8, 8, 8, 8, 8], // Default sleep goal (8 hours)
          borderColor: "rgba(28, 200, 138, 0.8)",
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
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
          displayColors: true,
          usePointStyle: true,
          callbacks: {
            label: function (context) {
              return context.dataset.label + ": " + context.raw + " hours";
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(66, 66, 66, 0.5)",
            drawBorder: true,
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
            drawBorder: true,
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
  });

  console.log("Chart initialized:", weeklyChart); // Confirm chart is initialized

  // Updated: Sidebar toggle for new sidebar structure
  $("#sidebarToggle").on("click", function () {
    $(".sidebar").toggleClass("active");

    if ($(".sidebar").hasClass("active")) {
      $(".main-content").css({
        "margin-left": "0",
        width: "100%",
      });
    } else {
      $(".main-content").css({
        "margin-left": "280px",
        width: "calc(100% - 280px)",
      });
    }
  });

  // Handle weekly chart toggle between line and bar
  $("#chartTypeToggle").on("change", function () {
    console.log("Chart type toggle clicked"); // Debug info
    const chartType = $(this).prop("checked") ? "bar" : "line";

    // Get current chart instance
    const chart = Chart.getChart("weeklyChart");
    if (!chart) {
      console.error("Chart not found when toggling type");
      return;
    }

    const currentData = chart.data;
    chart.destroy();

    const newChart = new Chart(weeklyChartCtx, {
      type: chartType,
      data: currentData,
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
            displayColors: true,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                return context.dataset.label + ": " + context.raw + " hours";
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(66, 66, 66, 0.5)",
              drawBorder: true,
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
              drawBorder: true,
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
    });

    console.log("Chart type changed to:", chartType);
  });

  // Handle custom filter form
  $("#applyFilters").click(function () {
    console.log("Apply filters clicked"); // Debug info

    // Custom filter function
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
      // Get filter values
      let dateFrom = $("#dateFrom").val()
        ? new Date($("#dateFrom").val())
        : null;
      let dateTo = $("#dateTo").val() ? new Date($("#dateTo").val()) : null;
      let durationMin = $("#durationMin").val()
        ? parseFloat($("#durationMin").val())
        : 0;
      let durationMax = $("#durationMax").val()
        ? parseFloat($("#durationMax").val())
        : 24;
      let qualityFilter = $("#qualityFilter").val();
      let moodFilter = $("#moodFilter").val();

      console.log("Filter values:", {
        dateFrom,
        dateTo,
        durationMin,
        durationMax,
        qualityFilter,
        moodFilter,
      });

      // Get data from row
      let date = new Date(data[0]);
      let durationText = data[3];
      let duration = parseFloat(durationText.replace(" hrs", ""));

      // Use regex to extract class names from HTML tags
      let qualityMatch = data[4].match(/class="quality ([^"]+)"/);
      let quality = qualityMatch ? qualityMatch[1].toLowerCase() : "";

      let moodMatch = data[5].match(/class="mood ([^"]+)"/);
      let mood = moodMatch ? moodMatch[1].toLowerCase() : "";

      console.log("Row data:", { date, duration, quality, mood });

      // Check each filter condition
      let dateOk =
        (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
      let durationOk =
        (!durationMin || duration >= durationMin) &&
        (!durationMax || duration <= durationMax);
      let qualityOk = !qualityFilter || quality === qualityFilter;
      let moodOk = !moodFilter || mood === moodFilter;

      let showRow = dateOk && durationOk && qualityOk && moodOk;
      console.log("Show row?", showRow);

      return showRow;
    });

    // Apply filters and redraw table
    sleepTable.draw();

    // Remove the custom filter function to avoid stacking
    $.fn.dataTable.ext.search.pop();
  });

  // Clear filters
  $("#clearFilters").click(function () {
    console.log("Clear filters clicked"); // Debug info
    $("#filterForm")[0].reset();
    sleepTable.search("").columns().search("").draw();
  });

  // Edit button click handler
  $("#sleepHistoryTable").on("click", ".edit-btn", function (e) {
    console.log("Edit button clicked"); // Debug info
    e.preventDefault(); // Prevent default action
    e.stopPropagation(); // Prevent event bubbling

    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let cells = row.find("td");

    // Populate edit form with current values
    $("#editEntryId").val(id);
    $("#editSleepDate").val(cells.eq(0).text());
    $("#editSleepTime").val(cells.eq(1).text());
    $("#editWakeTime").val(cells.eq(2).text());

    // Extract quality value from span tag
    let qualityText = cells.eq(4).find("span").text().toLowerCase();
    $("#editSleepQuality").val(qualityText);

    // Extract mood value from span tag
    let moodText = cells.eq(5).find("span").text().toLowerCase();
    $("#editMorningMood").val(moodText);

    $("#editSleepNotes").val(cells.eq(6).text());

    // Show the edit modal
    $("#editEntryModal").modal("show");
  });

  // Delete button click handler
  $("#sleepHistoryTable").on("click", ".delete-btn", function (e) {
    console.log("Delete button clicked"); // Debug info
    e.preventDefault(); // Prevent default action
    e.stopPropagation(); // Prevent event bubbling

    let id = $(this).data("id");
    $("#deleteEntryId").val(id);
    $("#deleteConfirmModal").modal("show");
  });

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

    // Update goal display
    $("#currentGoalValue").text(totalHours.toFixed(1));

    // Update progress circle
    const averageDuration = parseFloat(
      $('.card:contains("Average Sleep Duration")').find(".h5").text()
    );
    const percentage = Math.min(
      100,
      Math.round((averageDuration / totalHours) * 100)
    );
    updateProgressCircle(percentage);

    // Update the goal line in the chart
    updateChartGoalLine(totalHours);

    // Close the modal
    $("#sleepGoalModal").modal("hide");

    // Show success message
    showToast("Sleep goal updated successfully!", "success");
  });

  // Function to update the progress circle
  function updateProgressCircle(percentage) {
    // Update the circle progress
    const circle = document.querySelector(".progress-circle");
    const radius = 55; // radius of the circle
    const circumference = 2 * Math.PI * radius;

    // Calculate the stroke-dashoffset based on percentage
    const offset = circumference - (percentage / 100) * circumference;

    // Update the SVG circle properties
    const progressCircle = document.querySelector("#goalProgress");
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;

    // Update the percentage text
    document.querySelector("#goalPercentage").textContent = `${percentage}%`;

    // Update the color based on percentage
    if (percentage >= 100) {
      progressCircle.style.stroke = "#1cc88a"; // Success color
    } else if (percentage >= 75) {
      progressCircle.style.stroke = "#36b9cc"; // Info color
    } else if (percentage >= 50) {
      progressCircle.style.stroke = "#f6c23e"; // Warning color
    } else {
      progressCircle.style.stroke = "#e74a3b"; // Danger color
    }
  }

  // Function to update the goal line in the chart
  function updateChartGoalLine(goalHours) {
    const chart = Chart.getChart("weeklyChart");
    if (chart) {
      // Update the second dataset (goal line)
      chart.data.datasets[1].data = Array(7).fill(goalHours);
      chart.update();
    }
  }

  // Update entry button click handler
  $("#updateEntryBtn").click(function () {
    console.log("Update entry button clicked"); // Debug info
    // In a real app, this would send data to the server
    // For now, just update the table directly

    // Form validation
    let form = $("#editEntryForm")[0];
    if (form.checkValidity() === false) {
      form.classList.add("was-validated");
      return;
    }

    let id = $("#editEntryId").val();
    let date = $("#editSleepDate").val();
    let sleepTime = $("#editSleepTime").val();
    let wakeTime = $("#editWakeTime").val();
    let quality = $("#editSleepQuality").val();
    let mood = $("#editMorningMood").val();
    let notes = $("#editSleepNotes").val();

    // Calculate duration (simple example, doesn't handle overnight)
    let sleepDate = new Date(`${date}T${sleepTime}`);
    let wakeDate = new Date(`${date}T${wakeTime}`);
    let diffMs = wakeDate - sleepDate;
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // Add 24 hours if wake time is next day
    let durationHrs = (diffMs / (1000 * 60 * 60)).toFixed(1);

    // Create HTML for quality and mood spans
    let qualityHTML = `<span class="quality ${quality}">${
      quality.charAt(0).toUpperCase() + quality.slice(1)
    }</span>`;
    let moodHTML = `<span class="mood ${mood}">${
      mood.charAt(0).toUpperCase() + mood.slice(1)
    }</span>`;

    // Find the row to update
    let rowToUpdate;
    sleepTable.rows().every(function () {
      let rowData = this.data();
      let rowNode = this.node();
      let rowButtons = $(rowNode).find("td:last-child button");
      if (rowButtons.length && rowButtons.first().data("id") == id) {
        rowToUpdate = this;
        return false; // break the loop
      }
    });

    if (rowToUpdate) {
      // Update the row data
      rowToUpdate
        .data([
          date,
          sleepTime,
          wakeTime,
          durationHrs + " hrs",
          qualityHTML,
          moodHTML,
          notes,
          `<button class="btn btn-link btn-sm edit-btn" data-id="${id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-link btn-sm delete-btn" data-id="${id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>`,
        ])
        .draw(false);

      // Update the weekly chart if the entry corresponds to a day in the current week
      updateWeeklyChartData();
    }

    // Reset form and close modal
    form.reset();
    $("#editEntryModal").modal("hide");

    // Show success message
    showToast("Sleep entry updated successfully!", "success");
  });

  // Confirm delete button handler
  $("#confirmDeleteBtn").click(function () {
    console.log("Confirm delete button clicked"); // Debug info
    let id = $("#deleteEntryId").val();

    // Find the row to delete
    sleepTable.rows().every(function () {
      let rowNode = this.node();
      let rowButtons = $(rowNode).find("td:last-child button");
      if (rowButtons.length && rowButtons.first().data("id") == id) {
        this.remove().draw(false);
        return false; // break the loop
      }
    });

    // Update the weekly chart after deletion
    updateWeeklyChartData();

    // Close the modal
    $("#deleteConfirmModal").modal("hide");

    // Show success message
    showToast("Sleep entry deleted successfully!", "success");
  });

  // Function to show toast notifications
  function showToast(message, type = "info") {
    // Create toast container if it doesn't exist
    if ($("#toastContainer").length === 0) {
      $("body").append(
        '<div id="toastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1100;"></div>'
      );
    }

    // Create a unique ID for the toast
    const toastId = "toast-" + Date.now();

    // Set the appropriate bg class based on type
    let bgClass = "bg-primary";
    if (type === "success") bgClass = "bg-success";
    if (type === "warning") bgClass = "bg-warning";
    if (type === "error") bgClass = "bg-danger";

    // Create the toast HTML
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

    // Add the toast to the container
    $("#toastContainer").append(toast);

    // Initialize and show the toast
    const toastElement = new bootstrap.Toast(document.getElementById(toastId), {
      delay: 3000,
      animation: true,
    });

    toastElement.show();

    // Remove the toast from DOM after it's hidden
    $(`#${toastId}`).on("hidden.bs.toast", function () {
      $(this).remove();
    });
  }

  // Update weekly chart data based on table entries
  function updateWeeklyChartData() {
    // Map day names to day indices (0 = Monday, 6 = Sunday)
    const dayMapping = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    };

    // Get the current week's dates
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday in JS
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust to get Monday

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + mondayOffset);

    // Create an array of dates for the current week (Monday to Sunday)
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + i);
      weekDates.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }

    // Initialize empty data array (default to null so chart shows gaps)
    const weeklyData = Array(7).fill(null);

    // Collect data from the table for the current week
    sleepTable.rows().every(function () {
      const data = this.data();
      const entryDate = data[0]; // Date in YYYY-MM-DD format

      // Check if the entry belongs to the current week
      const weekIndex = weekDates.indexOf(entryDate);
      if (weekIndex !== -1) {
        // Get duration in hours
        const duration = parseFloat(data[3].replace(" hrs", ""));
        weeklyData[weekIndex] = duration;
      }
    });

    // Update the chart with new data
    const chart = Chart.getChart("weeklyChart");
    if (chart) {
      chart.data.datasets[0].data = weeklyData;
      chart.update();
    }
  }

  // Calculate and update summary stats
  function updateSummaryStats() {
    // This would typically be calculated from the server
    // For demo purposes, we'll calculate from the visible table data

    let totalDuration = 0;
    let qualityCounts = { excellent: 0, good: 0, fair: 0, poor: 0 };
    let sleepTimes = [];
    let wakeTimes = [];

    sleepTable.rows({ search: "applied" }).every(function () {
      let data = this.data();

      // Duration
      let duration = parseFloat(data[3].replace(" hrs", ""));
      totalDuration += duration;

      // Quality
      let quality = data[4].toLowerCase();
      if (quality.includes("excellent")) qualityCounts.excellent++;
      if (quality.includes("good")) qualityCounts.good++;
      if (quality.includes("fair")) qualityCounts.fair++;
      if (quality.includes("poor")) qualityCounts.poor++;

      // Sleep and wake times
      sleepTimes.push(data[1]);
      wakeTimes.push(data[2]);
    });

    // Calculate averages
    let rowCount = sleepTable.rows({ search: "applied" }).count();
    let averageDuration =
      rowCount > 0 ? (totalDuration / rowCount).toFixed(1) : 0;

    // Find most common quality
    let maxQuality = "";
    let maxCount = 0;
    for (let q in qualityCounts) {
      if (qualityCounts[q] > maxCount) {
        maxCount = qualityCounts[q];
        maxQuality = q.charAt(0).toUpperCase() + q.slice(1);
      }
    }

    // Update the summary cards
    $('.card:contains("Average Sleep Duration")')
      .find(".h5")
      .text(averageDuration + " hrs");
    $('.card:contains("Most Common Quality")').find(".h5").text(maxQuality);

    // Calculate median for sleep and wake times (simplified approach)
    if (sleepTimes.length > 0) {
      sleepTimes.sort();
      wakeTimes.sort();

      let medianIndex = Math.floor(sleepTimes.length / 2);
      let medianSleepTime = sleepTimes[medianIndex];
      let medianWakeTime = wakeTimes[medianIndex];

      $('.card:contains("Usual Bedtime")').find(".h5").text(medianSleepTime);
      $('.card:contains("Usual Wake Time")').find(".h5").text(medianWakeTime);
    }

    // Update progress circle if a goal is set
    const goalValue = parseFloat($("#currentGoalValue").text());
    if (!isNaN(goalValue) && goalValue > 0) {
      const percentage = Math.min(
        100,
        Math.round((averageDuration / goalValue) * 100)
      );
      updateProgressCircle(percentage);
    }
  }

  // Initial chart data update
  updateWeeklyChartData();

  // Call updateSummaryStats on initial load and after any table changes
  updateSummaryStats();
  sleepTable.on("draw", updateSummaryStats);

  // Set current date as default for date inputs
  const today = new Date().toISOString().split("T")[0];
  $("#dateFrom").val(today);
  $("#dateTo").val(today);

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

  // Initialize goal circle
  updateProgressCircle(75); // Default value until real data is calculated
});
