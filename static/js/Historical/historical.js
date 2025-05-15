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
      emptyTable: "No sleep records found. Start tracking your sleep!", // Added for empty tables
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
        defaultContent:
          '<button class="btn btn-link btn-sm edit-btn" title="Edit"><i class="fas fa-edit"></i></button><button class="btn btn-link btn-sm delete-btn" title="Delete"><i class="fas fa-trash"></i></button>', // Default content for empty rows
      },
    ],
    dom: '<"d-flex justify-content-between align-items-center mb-3"<"d-flex align-items-center"l><"d-flex"f>>t<"d-flex justify-content-between align-items-center mt-3"<"d-flex"i><"d-flex"p>>',
  });

  // Force recalculation and update of the percentage display
  function forceUpdateGoalCircle() {
    try {
      // Get the average sleep duration directly from the page
      const durationText =
        $('.card:contains("Average Sleep Duration")').find(".h5").text() ||
        "0 hrs";
      const averageDuration =
        parseFloat(durationText.replace(/[^\d.-]/g, "")) || 0;

      // Get the current goal value directly from the page
      const goalText = $("#currentGoalValue").text() || "8.0";
      const goalValue = parseFloat(goalText);

      // Calculate the percentage
      if (!isNaN(goalValue) && goalValue > 0 && !isNaN(averageDuration)) {
        const percentage = Math.round((averageDuration / goalValue) * 100);

        // Update the DOM directly
        updateProgressCircle(percentage);
        console.log("Forced update of goal circle to: " + percentage + "%");
      } else {
        console.log("Invalid values for calculation:", {
          averageDuration,
          goalValue,
        });
      }
    } catch (err) {
      console.error("Error in forceUpdateGoalCircle:", err);
    }
  }

  // Trigger the force update function in different situations
  setTimeout(forceUpdateGoalCircle, 500); // Run after page load with a short delay
  $("#sleepHistoryTable").on("draw.dt", forceUpdateGoalCircle); // When the table data is re-rendered
  $("body").on(
    "DOMSubtreeModified",
    ".card:contains('Average Sleep Duration') .h5",
    forceUpdateGoalCircle
  ); // When the average sleep duration changes

  // Add a periodic check to ensure the display stays accurate
  setInterval(forceUpdateGoalCircle, 2000); // Check every 2 seconds

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

      // Add page load event listener
      $(window).on("load", function () {
        setTimeout(forceUpdateGoalCircle, 500);
      });

      // Listen for AJAX completion events
      $(document).ajaxComplete(function () {
        setTimeout(forceUpdateGoalCircle, 300);
      });

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
    let row = $(this).closest("tr");
    let rowData = sleepTable.row(row).data();

    if (!id && rowData && rowData.length > 7 && rowData[7]) {
      // Try to extract ID from HTML in the row data
      let idMatch = rowData[7].match(/data-id="(\d+)"/);
      if (idMatch && idMatch[1]) {
        id = idMatch[1];
      }
    }

    if (!id) {
      console.error("No ID found for edit button");
      return;
    }

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
    let row = $(this).closest("tr");
    let rowData = sleepTable.row(row).data();

    // If ID is missing, try to extract it from the row
    if (!id && rowData && rowData.length > 7 && rowData[7]) {
      let idMatch = rowData[7].match(/data-id="(\d+)"/);
      if (idMatch && idMatch[1]) {
        id = idMatch[1];
      }
    }

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

  // Function to update the progress circle with correct calculation
  function updateProgressCircle(percentage) {
    // Get progress circle element with validation
    const progressCircle = document.getElementById("goalProgress");
    if (!progressCircle) {
      console.error("Progress circle element not found");
      return;
    }

    const radius = 55; // Circle radius
    const circumference = 2 * Math.PI * radius;

    // Ensure percentage is a valid number and capped at 100%
    let validPercentage = percentage;
    if (isNaN(validPercentage) || validPercentage < 0) {
      validPercentage = 0;
    } else if (validPercentage > 100) {
      validPercentage = 100;
    }

    // Calculate stroke-dashoffset based on percentage
    const offset = circumference - (validPercentage / 100) * circumference;

    // Update SVG circle properties
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;

    // Update percentage text
    const percentageText = document.getElementById("goalPercentage");
    if (percentageText) {
      percentageText.textContent = `${Math.round(validPercentage)}%`;
    }

    // Update color based on percentage
    if (validPercentage >= 100) {
      progressCircle.style.stroke = "#1cc88a"; // Success color
    } else if (validPercentage >= 75) {
      progressCircle.style.stroke = "#36b9cc"; // Info color
    } else if (validPercentage >= 50) {
      progressCircle.style.stroke = "#f6c23e"; // Warning color
    } else {
      progressCircle.style.stroke = "#e74a3b"; // Danger color
    }
  }

  // Enhanced function to update summary stats with proper goal calculation
  function updateSummaryStats() {
    try {
      let totalDuration = 0;
      let recordCount = 0;
      let qualityCounts = { excellent: 0, good: 0, fair: 0, poor: 0 };
      let sleepTimes = [];
      let wakeTimes = [];
      let dates = new Set(); // Track unique dates to prevent duplicates in calculations

      // Process visible rows in the table
      sleepTable.rows({ search: "applied" }).every(function () {
        let data = this.data();
        if (!data) return;

        // Get date to check for duplicates
        const dateStr = data[0]?.trim();
        if (!dateStr) return;

        // Skip if we've already processed this date (prevents duplicate counting)
        if (dates.has(dateStr)) return;
        dates.add(dateStr);

        recordCount++;

        // Duration - extract numeric value safely
        let durationText = data[3] || "0 hrs";
        let duration = parseFloat(durationText.replace(/[^\d.-]/g, "")) || 0;
        if (!isNaN(duration)) {
          totalDuration += duration;
        }

        // Quality counting
        let qualityText = data[4] ? $(data[4]).text().toLowerCase() : "";
        if (qualityText.includes("excellent")) qualityCounts.excellent++;
        if (qualityText.includes("good")) qualityCounts.good++;
        if (qualityText.includes("fair")) qualityCounts.fair++;
        if (qualityText.includes("poor")) qualityCounts.poor++;

        // Sleep and wake times - collect values if present
        if (data[1]) sleepTimes.push(data[1].trim());
        if (data[2]) wakeTimes.push(data[2].trim());
      });

      // Only update if records exist
      if (recordCount > 0) {
        // Calculate averages
        let averageDuration = (totalDuration / recordCount).toFixed(1);

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

          $('.card:contains("Usual Bedtime")')
            .find(".h5")
            .text(medianSleepTime);
          $('.card:contains("Usual Wake Time")')
            .find(".h5")
            .text(medianWakeTime);
        }

        // Update goal achievement percentage
        const goalValueText = $("#currentGoalValue").text() || "8.0";
        const goalValue = parseFloat(goalValueText);
        console.log("Current goal value:", goalValue);
        console.log("Average duration:", averageDuration);

        if (!isNaN(goalValue) && goalValue > 0 && !isNaN(averageDuration)) {
          // Calculate percentage based on the user's actual average sleep divided by their goal
          // This correctly reflects how close they are to meeting their goal on average
          const percentage = Math.round(
            (parseFloat(averageDuration) / goalValue) * 100
          );
          console.log("Calculated percentage:", percentage);
          updateProgressCircle(percentage);
        }
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
  updateProgressCircle(0); // Default value until real data is calculated
});
