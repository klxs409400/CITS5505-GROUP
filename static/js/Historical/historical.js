$(document).ready(function () {
  // Initialize DataTables with proper configuration
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

  // Sidebar toggle functionality
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

  // Handle custom filter form
  $("#applyFilters").click(function () {
    console.log("Apply filters clicked"); // Debug info

    // Remove previous filter functions to prevent duplication
    while ($.fn.dataTable.ext.search.length > 0) {
      $.fn.dataTable.ext.search.pop();
    }

    // Add custom filter function
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
      // Get filter values with proper validation
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

      // Get row data with safer parsing
      try {
        // Parse date safely
        let date = data[0] ? new Date(data[0]) : null;

        // Extract duration (removing " hrs" text)
        let durationText = data[3] || "0 hrs";
        let duration = parseFloat(durationText.replace(/[^\d.-]/g, "")) || 0;

        // Extract quality and mood more reliably
        let quality = "";
        let mood = "";

        // Use a safer approach to extract quality/mood values
        if (data[4]) {
          // Try to extract from HTML first
          let qualityMatch = data[4].match(/class="quality ([^"]+)"/);
          if (qualityMatch) {
            quality = qualityMatch[1].toLowerCase();
          } else {
            // Fallback: just take the text and lowercase it
            quality = $($.parseHTML(data[4])).text().toLowerCase().trim();
          }
        }

        if (data[5]) {
          let moodMatch = data[5].match(/class="mood ([^"]+)"/);
          if (moodMatch) {
            mood = moodMatch[1].toLowerCase();
          } else {
            mood = $($.parseHTML(data[5])).text().toLowerCase().trim();
          }
        }

        // Check each filter condition with proper validation
        let dateOk = true;
        if (
          dateFrom instanceof Date &&
          !isNaN(dateFrom) &&
          date instanceof Date &&
          !isNaN(date)
        ) {
          dateOk = date >= dateFrom;
        }
        if (
          dateTo instanceof Date &&
          !isNaN(dateTo) &&
          date instanceof Date &&
          !isNaN(date)
        ) {
          dateOk = dateOk && date <= dateTo;
        }

        let durationOk =
          (!durationMin || duration >= durationMin) &&
          (!durationMax || duration <= durationMax);

        let qualityOk =
          !qualityFilter || quality.includes(qualityFilter.toLowerCase());
        let moodOk = !moodFilter || mood.includes(moodFilter.toLowerCase());

        return dateOk && durationOk && qualityOk && moodOk;
      } catch (e) {
        console.error("Error filtering row:", e);
        return true; // Show row in case of error
      }
    });

    // Apply filters and redraw table
    sleepTable.draw();
  });

  // Clear filters
  $("#clearFilters").click(function () {
    console.log("Clear filters clicked"); // Debug info
    // Reset form
    $("#filterForm")[0].reset();

    // Remove filter functions
    while ($.fn.dataTable.ext.search.length > 0) {
      $.fn.dataTable.ext.search.pop();
    }

    // Clear search and redraw table
    sleepTable.search("").columns().search("").draw();
  });

  // Edit button click handler - improved to handle the DOM more safely
  $("#sleepHistoryTable").on("click", ".edit-btn", function (e) {
    console.log("Edit button clicked"); // Debug info
    e.preventDefault(); // Prevent default action
    e.stopPropagation(); // Prevent event bubbling

    let id = $(this).data("id");
    if (!id) {
      console.error("No ID found for edit button");
      return;
    }

    let row = $(this).closest("tr");
    let cells = row.find("td");

    // Safely populate edit form with current values
    $("#editEntryId").val(id);

    // Get date value
    let dateValue = cells.eq(0).text().trim();
    $("#editSleepDate").val(dateValue);

    // Get sleep time
    let sleepTimeValue = cells.eq(1).text().trim();
    $("#editSleepTime").val(sleepTimeValue);

    // Get wake time
    let wakeTimeValue = cells.eq(2).text().trim();
    $("#editWakeTime").val(wakeTimeValue);

    // Extract quality value from span tag - more robust method
    let qualityElement = cells.eq(4).find("span");
    let qualityText = "";

    if (qualityElement.length) {
      qualityText = qualityElement.text().toLowerCase().trim();
    } else {
      qualityText = cells.eq(4).text().toLowerCase().trim();
    }

    // Set dropdown value, with fallback options
    if ($("#editSleepQuality option[value='" + qualityText + "']").length) {
      $("#editSleepQuality").val(qualityText);
    } else if (qualityText.includes("excellent")) {
      $("#editSleepQuality").val("excellent");
    } else if (qualityText.includes("good")) {
      $("#editSleepQuality").val("good");
    } else if (qualityText.includes("fair")) {
      $("#editSleepQuality").val("fair");
    } else if (qualityText.includes("poor")) {
      $("#editSleepQuality").val("poor");
    }

    // Extract mood value from span tag - more robust method
    let moodElement = cells.eq(5).find("span");
    let moodText = "";

    if (moodElement.length) {
      moodText = moodElement.text().toLowerCase().trim();
    } else {
      moodText = cells.eq(5).text().toLowerCase().trim();
    }

    // Set dropdown value, with fallback options
    if ($("#editMorningMood option[value='" + moodText + "']").length) {
      $("#editMorningMood").val(moodText);
    } else if (moodText.includes("refreshed")) {
      $("#editMorningMood").val("refreshed");
    } else if (moodText.includes("neutral")) {
      $("#editMorningMood").val("neutral");
    } else if (moodText.includes("tired")) {
      $("#editMorningMood").val("tired");
    } else if (moodText.includes("exhausted")) {
      $("#editMorningMood").val("exhausted");
    }

    // Extract notes
    $("#editSleepNotes").val(cells.eq(6).text().trim());

    // Set form submission URL correctly
    let editUrl = "/edit-sleep/" + id;
    $("#editEntryForm").attr("action", editUrl);

    console.log("Form configured for editing record ID:", id);

    // Show edit modal
    $("#editEntryModal").modal("show");
  });

  // Delete button click handler - improved with better error handling
  $("#sleepHistoryTable").on("click", ".delete-btn", function (e) {
    console.log("Delete button clicked"); // Debug info
    e.preventDefault();
    e.stopPropagation();

    let id = $(this).data("id");
    if (!id) {
      console.error("No ID found for delete button");
      return;
    }

    $("#deleteEntryId").val(id);

    // Set delete form submission URL
    let deleteUrl = "/delete-sleep/" + id;
    $("#deleteEntryForm").attr("action", deleteUrl);

    $("#deleteConfirmModal").modal("show");
  });

  // Update Sleep Goal handler
  $("#saveGoalBtn").click(function (e) {
    // Get values with validation
    const sleepGoalHours = parseFloat($("#sleepGoalHours").val() || "8");
    const sleepGoalMinutes = parseInt($("#sleepGoalMinutes").val() || "0");

    if (isNaN(sleepGoalHours) || isNaN(sleepGoalMinutes)) {
      alert("Please enter valid numbers for sleep goal");
      e.preventDefault();
      return;
    }

    const totalHours = sleepGoalHours + sleepGoalMinutes / 60;
    $("#currentGoalValue").text(totalHours.toFixed(1));

    // Get average duration with fallback
    let averageDuration = 0;
    try {
      averageDuration =
        parseFloat(
          $('.card:contains("Average Sleep Duration")').find(".h5").text()
        ) || 0;
    } catch (err) {
      console.error("Error getting average duration:", err);
      averageDuration = 0;
    }

    // Calculate percentage with safety check to avoid division by zero
    const percentage =
      totalHours > 0
        ? Math.min(100, Math.round((averageDuration / totalHours) * 100))
        : 0;

    updateProgressCircle(percentage);

    // Success notification
    showToast("Sleep goal updated successfully!", "success");
  });

  // Sleep goal dropdown change handlers
  $("#sleepGoalHours").change(function () {
    updateSleepGoal("hours", $(this).val());
  });

  $("#sleepGoalMinutes").change(function () {
    updateSleepGoal("minutes", $(this).val());
  });

  // Function to update sleep goal
  function updateSleepGoal(type, value) {
    console.log(`Updated ${type} to ${value}`);
    // Add AJAX request or other logic here, e.g., update database or refresh UI
  }

  // Function to update the progress circle - single optimized implementation
  function updateProgressCircle(percentage) {
    // Get progress circle element with validation
    const progressCircle = document.querySelector("#goalProgress");
    if (!progressCircle) {
      console.error("Progress circle element not found");
      return;
    }

    const radius = 55; // Circle radius
    const circumference = 2 * Math.PI * radius;

    // Calculate stroke-dashoffset based on percentage
    const offset = circumference - (percentage / 100) * circumference;

    // Update SVG circle properties
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;

    // Update percentage text
    const percentageText = document.querySelector("#goalPercentage");
    if (percentageText) {
      percentageText.textContent = `${percentage}%`;
    }

    // Update color based on percentage
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

  // Update entry button - Fixed to properly handle form validation
  $("#updateEntryBtn").on("click", function (e) {
    console.log("Update entry button clicked");

    // Form validation
    let form = $("#editEntryForm")[0];
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    // Form will be automatically submitted to edit-sleep route
    // No need to prevent default - allow normal form submission
  });

  // Function to show toast notifications
  function showToast(message, type = "info") {
    // Create toast container if it doesn't exist
    if ($("#toastContainer").length === 0) {
      $("body").append(
        '<div id="toastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1100;"></div>'
      );
    }

    // Create unique ID for toast
    const toastId = "toast-" + Date.now();

    // Set appropriate bg class based on type
    let bgClass = "bg-primary";
    if (type === "success") bgClass = "bg-success";
    if (type === "warning") bgClass = "bg-warning";
    if (type === "error") bgClass = "bg-danger";

    // Create toast HTML
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

  // Calculate and update summary statistics
  function updateSummaryStats() {
    try {
      let totalDuration = 0;
      let qualityCounts = { excellent: 0, good: 0, fair: 0, poor: 0 };
      let sleepTimes = [];
      let wakeTimes = [];

      // Process visible rows in the table
      sleepTable.rows({ search: "applied" }).every(function () {
        let data = this.data();
        if (!data) return;

        // Duration - extract numeric value safely
        let durationText = data[3] || "0 hrs";
        let duration = parseFloat(durationText.replace(/[^\d.-]/g, "")) || 0;
        if (!isNaN(duration)) {
          totalDuration += duration;
        }

        // Quality - count occurrences safely
        let qualityText = data[4] ? data[4].toLowerCase() : "";
        if (qualityText.includes("excellent")) qualityCounts.excellent++;
        if (qualityText.includes("good")) qualityCounts.good++;
        if (qualityText.includes("fair")) qualityCounts.fair++;
        if (qualityText.includes("poor")) qualityCounts.poor++;

        // Sleep and wake times - collect values if present
        if (data[1]) sleepTimes.push(data[1].trim());
        if (data[2]) wakeTimes.push(data[2].trim());
      });

      // Calculate averages
      let rowCount = sleepTable.rows({ search: "applied" }).count() || 1; // Avoid division by zero
      let averageDuration = (totalDuration / rowCount).toFixed(1);

      // Find most common quality
      let maxQuality = "Good"; // Default value
      let maxCount = 0;
      for (let q in qualityCounts) {
        if (qualityCounts[q] > maxCount) {
          maxCount = qualityCounts[q];
          maxQuality = q.charAt(0).toUpperCase() + q.slice(1);
        }
      }

      // Update summary cards safely
      $('.card:contains("Average Sleep Duration")')
        .find(".h5")
        .text(averageDuration + " hrs");
      $('.card:contains("Most Common Quality")').find(".h5").text(maxQuality);

      // Calculate median for sleep and wake times
      if (sleepTimes.length > 0) {
        sleepTimes.sort();
        wakeTimes.sort();

        let medianIndex = Math.floor(sleepTimes.length / 2);
        let medianSleepTime = sleepTimes[medianIndex] || "23:00";
        let medianWakeTime = wakeTimes[medianIndex] || "07:00";

        $('.card:contains("Usual Bedtime")').find(".h5").text(medianSleepTime);
        $('.card:contains("Usual Wake Time")').find(".h5").text(medianWakeTime);
      }

      // Update progress circle if a goal is set
      const goalValueText = $("#currentGoalValue").text() || "8.0";
      const goalValue = parseFloat(goalValueText);
      if (!isNaN(goalValue) && goalValue > 0) {
        const percentage = Math.min(
          100,
          Math.round((averageDuration / goalValue) * 100)
        );
        updateProgressCircle(percentage);
      }
    } catch (err) {
      console.error("Error updating summary stats:", err);
    }
  }

  // Initialize and call updateSummaryStats on table changes
  updateSummaryStats();
  sleepTable.on("draw", updateSummaryStats);

  // Set current date as default for date inputs
  try {
    const today = new Date().toISOString().split("T")[0];
    $("#dateFrom").val(today);
    $("#dateTo").val(today);
  } catch (e) {
    console.error("Error setting default dates:", e);
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

  // Initialize goal circle with default value
  updateProgressCircle(75); // Default value until real data is calculated
});
