$(document).ready(function () {
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

  // Sidebar toggle
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

  // Handle custom filter form - Fix filter functionality
  $("#applyFilters").click(function () {
    console.log("Apply filters clicked"); // Debug info

    // Remove previous filter functions to prevent duplication
    while ($.fn.dataTable.ext.search.length > 0) {
      $.fn.dataTable.ext.search.pop();
    }

    // Add custom filter function
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

      // Get row data
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

  // Edit button click handler - Fix edit functionality
  $("#sleepHistoryTable").on("click", ".edit-btn", function (e) {
    console.log("Edit button clicked"); // Debug info
    e.preventDefault(); // Prevent default action
    e.stopPropagation(); // Prevent event bubbling

    let id = $(this).data("id");
    let row = $(this).closest("tr");
    let cells = row.find("td");

    // Populate edit form with current values
    $("#editEntryId").val(id);
    $("#editSleepDate").val(cells.eq(0).text().trim());
    $("#editSleepTime").val(cells.eq(1).text().trim());
    $("#editWakeTime").val(cells.eq(2).text().trim());

    // Extract quality value from span tag
    let qualityText = cells.eq(4).find("span").text().toLowerCase().trim();
    $("#editSleepQuality").val(qualityText);

    // Extract mood value from span tag
    let moodText = cells.eq(5).find("span").text().toLowerCase().trim();
    $("#editMorningMood").val(moodText);

    // Extract notes
    $("#editSleepNotes").val(cells.eq(6).text().trim());

    // Set form submission URL - Fix edit functionality
    let editUrl = "/edit-sleep/" + id;
    $("#editEntryForm").attr("action", editUrl);

    console.log("Setting form action to:", editUrl);
    console.log("Form values:", {
      id: id,
      date: cells.eq(0).text(),
      sleepTime: cells.eq(1).text(),
      wakeTime: cells.eq(2).text(),
      quality: qualityText,
      mood: moodText,
      notes: cells.eq(6).text(),
    });

    // Show edit modal
    $("#editEntryModal").modal("show");
  });

  // Delete button click handler
  $("#sleepHistoryTable").on("click", ".delete-btn", function (e) {
    console.log("Delete button clicked"); // Debug info
    e.preventDefault();
    e.stopPropagation();

    let id = $(this).data("id");
    $("#deleteEntryId").val(id);

    // Set delete form submission URL
    let deleteUrl = "/delete-sleep/" + id;
    $("#deleteEntryForm").attr("action", deleteUrl);

    $("#deleteConfirmModal").modal("show");
  });

  // Update Sleep Goal handler
  $("#saveGoalBtn").click(function (event) {
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

    // Close the modal
    $("#sleepGoalModal").modal("hide");

    // Show success message
    showToast("Sleep goal updated successfully!", "success");
  });

  // Function to update the progress circle
  function updateProgressCircle(percentage) {
    // Get progress circle element
    const progressCircle = document.querySelector("#goalProgress");
    if (!progressCircle) return;

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

  // Update entry button - Replaced by form submission
  $("#updateEntryBtn").on("click", function () {
    console.log("Update entry button clicked");
    // Form validation
    let form = $("#editEntryForm")[0];
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add("was-validated");
      return;
    }

    // Form will be automatically submitted to edit-sleep route
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
    let totalDuration = 0;
    let qualityCounts = { excellent: 0, good: 0, fair: 0, poor: 0 };
    let sleepTimes = [];
    let wakeTimes = [];

    sleepTable.rows({ search: "applied" }).every(function () {
      let data = this.data();

      // Duration
      let duration = parseFloat(data[3].replace(" hrs", ""));
      if (!isNaN(duration)) {
        totalDuration += duration;
      }

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

    // Update summary cards
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

  // Initialize and call updateSummaryStats on table changes
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
