document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    checkAuthStatus()
  
    // DOM elements for the new UI
    const menuButton = document.getElementById("menu-button")
    const navDrawer = document.getElementById("nav-drawer")
    const backdrop = document.getElementById("backdrop")
    const navItems = document.querySelectorAll(".nav-item")
    const pages = document.querySelectorAll(".page")
    const userMenuButton = document.getElementById("user-menu-button")
    const userDropdown = document.getElementById("user-dropdown")
    const logoutButton = document.getElementById("logout-button")
    const dropdownLogoutButton = document.getElementById("dropdown-logout-button")
    const drawerUsername = document.getElementById("drawer-username")
    const dropdownUsername = document.getElementById("dropdown-username")
    const timeEntryForm = document.getElementById("timeEntryForm")
    const timeInputs = document.getElementById("timeInputs")
    const schoolDayCheckbox = document.getElementById("schoolDay")
    const summaryDiv = document.getElementById("summary")
    const totalWorkTimeSpan = document.getElementById("totalWorkTime")
    const totalBreakTimeSpan = document.getElementById("totalBreakTime")
    const overtimeUndertimeSpan = document.getElementById("overtimeUndertime")
    const closeSummaryBtn = document.getElementById("close-summary")
    const addAnotherBtn = document.getElementById("add-another")
    const resetFormBtn = document.getElementById("reset-form")
    const toggleBreakBtns = document.querySelectorAll(".toggle-break")
  
    // Time picker elements
    const timeControlBtns = document.querySelectorAll(".time-control-btn")
    const timeNumberInputs = document.querySelectorAll(".time-number-input")
  
    // Month navigation elements
    const prevMonthBtn = document.getElementById("prevMonth")
    const nextMonthBtn = document.getElementById("nextMonth")
    const monthSelect = document.getElementById("monthSelect")
    const yearSelect = document.getElementById("yearSelect")
    const timeRecordsBody = document.getElementById("timeRecordsBody")
    const totalMonthlyHours = document.getElementById("totalMonthlyHours")
    const totalMonthlyDays = document.getElementById("totalMonthlyDays")
    const totalMonthlyOvertime = document.getElementById("totalMonthlyOvertime")
  
    // Set today's date as default
    const today = new Date()
    document.getElementById("date").value = formatDate(today)
  
    // Initialize time pickers with default values
    initializeTimePickers()
  
    // Initialize month and year selectors
    initializeMonthYearSelectors()
  
    // Load current month's records
    loadMonthRecords(today.getMonth(), today.getFullYear())
  
    // Event listeners for navigation
    menuButton.addEventListener("click", toggleDrawer)
    backdrop.addEventListener("click", closeDrawer)
  
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        if (item.id !== "logout-button") {
          e.preventDefault()
          const targetPage = item.getAttribute("data-page")
          switchPage(targetPage)
          closeDrawer()
        }
      })
    })
  
    userMenuButton.addEventListener("click", toggleUserDropdown)
    logoutButton.addEventListener("click", handleLogout)
    dropdownLogoutButton.addEventListener("click", handleLogout)
  
    // Event listeners for time entry form
    schoolDayCheckbox.addEventListener("change", toggleTimeInputs)
    timeEntryForm.addEventListener("submit", handleFormSubmit)
    closeSummaryBtn.addEventListener("click", () => {
      summaryDiv.classList.add("hidden")
    })
  
    addAnotherBtn.addEventListener("click", () => {
      summaryDiv.classList.add("hidden")
      timeEntryForm.reset()
      document.getElementById("date").value = formatDate(today)
      schoolDayCheckbox.checked = false
      toggleTimeInputs()
      initializeTimePickers()
    })
  
    resetFormBtn.addEventListener("click", () => {
      timeEntryForm.reset()
      document.getElementById("date").value = formatDate(today)
      schoolDayCheckbox.checked = false
      toggleTimeInputs()
      initializeTimePickers()
    })
  
    // Event listeners for time pickers
    timeControlBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        const target = btn.getAttribute("data-target")
        const direction = btn.getAttribute("data-direction")
  
        if (target && direction) {
          adjustTimeValue(target, direction)
        }
      })
    })
  
    timeNumberInputs.forEach((input) => {
      input.addEventListener("input", () => {
        updateHiddenTimeInputs()
      })
  
      input.addEventListener("blur", () => {
        validateTimeInput(input)
        updateHiddenTimeInputs()
      })
  
      // Prevent non-numeric input
      input.addEventListener("keydown", (e) => {
        if (!/[0-9]|\Backspace|Tab|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|\Delete|Enter/.test(e.key)) {
          e.preventDefault()
        }
      })
    })
  
    toggleBreakBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const breakNumber = btn.getAttribute("data-break")
        const breakInputs = document.getElementById(`break${breakNumber}Inputs`)
  
        if (breakInputs.classList.contains("hidden")) {
          // Show break inputs
          breakInputs.classList.remove("hidden")
          setTimeout(() => {
            breakInputs.classList.add("visible")
          }, 10)
  
          // Update button
          btn.innerHTML = `
            <span class="material-icons">remove</span>
            <span class="toggle-text">Remove break</span>
          `
        } else {
          // Hide break inputs
          breakInputs.classList.remove("visible")
  
          setTimeout(() => {
            breakInputs.classList.add("hidden")
          }, 300)
  
          // Update button
          btn.innerHTML = `
            <span class="material-icons">add</span>
            <span class="toggle-text">Add break</span>
          `
  
          // Clear inputs
          document.getElementById(`break${breakNumber}StartHour`).value = ""
          document.getElementById(`break${breakNumber}StartMinute`).value = ""
          document.getElementById(`break${breakNumber}EndHour`).value = ""
          document.getElementById(`break${breakNumber}EndMinute`).value = ""
          document.getElementById(`break${breakNumber}Start`).value = ""
          document.getElementById(`break${breakNumber}End`).value = ""
        }
      })
    })
  
    // Event listeners for month navigation
    prevMonthBtn.addEventListener("click", navigateToPrevMonth)
    nextMonthBtn.addEventListener("click", navigateToNextMonth)
    monthSelect.addEventListener("change", handleMonthYearChange)
    yearSelect.addEventListener("change", handleMonthYearChange)
  
    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.remove("visible")
        setTimeout(() => {
          userDropdown.classList.add("hidden")
        }, 300)
      }
    })
  
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll(".btn, .btn-icon, .action-btn, .nav-item")
    buttons.forEach((button) => {
      button.addEventListener("click", createRipple)
    })
  
    // Functions
    function checkAuthStatus() {
      console.log("Checking authentication status...")
      fetch("/timecard/api/user/status", {
        credentials: "include", // Important for cookies
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Auth status response:", data)
          if (!data.authenticated) {
            // Redirect to login page if not authenticated
            console.log("Not authenticated, redirecting to login.html")
            window.location.href = "/timecard/login.html"
          } else {
            // Update UI with username
            console.log("Authenticated as:", data.username)
            drawerUsername.textContent = data.username
            dropdownUsername.textContent = data.username
          }
        })
        .catch((error) => {
          console.error("Error checking auth status:", error)
          // Redirect to login page on error
          window.location.href = "/timecard/login.html"
        })
    }
  
    function toggleDrawer() {
      navDrawer.classList.toggle("open")
      backdrop.classList.toggle("visible")
      document.body.classList.toggle("drawer-open")
    }
  
    function closeDrawer() {
      navDrawer.classList.remove("open")
      backdrop.classList.remove("visible")
      document.body.classList.remove("drawer-open")
    }
  
    function switchPage(pageId) {
      // Update active nav item
      navItems.forEach((item) => {
        if (item.getAttribute("data-page") === pageId) {
          item.classList.add("active")
        } else {
          item.classList.remove("active")
        }
      })
  
      // Show selected page
      pages.forEach((page) => {
        if (page.id === `${pageId}-page`) {
          page.classList.add("active")
        } else {
          page.classList.remove("active")
        }
      })
    }
  
    function toggleUserDropdown() {
      userDropdown.classList.remove("hidden")
      setTimeout(() => {
        userDropdown.classList.toggle("visible")
      }, 10)
    }
  
    function handleLogout() {
      fetch("/timecard/api/user/logout", {
        method: "POST",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            window.location.href = "/timecard/login.html"
          }
        })
        .catch((error) => {
          console.error("Error logging out:", error)
          showSnackbar("Error logging out. Please try again.")
        })
    }
  
    function toggleTimeInputs() {
      if (schoolDayCheckbox.checked) {
        timeInputs.classList.add("hidden")
      } else {
        timeInputs.classList.remove("hidden")
      }
    }
  
    function initializeTimePickers() {
      // Set default values for time pickers
      document.getElementById("arrivalHour").value = "09"
      document.getElementById("arrivalMinute").value = "00"
      document.getElementById("departureHour").value = "17"
      document.getElementById("departureMinute").value = "00"
      document.getElementById("break1StartHour").value = "12"
      document.getElementById("break1StartMinute").value = "00"
      document.getElementById("break1EndHour").value = "12"
      document.getElementById("break1EndMinute").value = "45"
  
      // Update hidden inputs
      updateHiddenTimeInputs()
    }
  
    function adjustTimeValue(target, direction) {
      const hourInput = document.getElementById(`${target}Hour`)
      const minuteInput = document.getElementById(`${target}Minute`)
  
      if (direction === "up") {
        if (document.activeElement === hourInput || !document.activeElement.classList.contains("time-number-input")) {
          // Increment hour
          let hour = Number.parseInt(hourInput.value || "0")
          hour = (hour + 1) % 24
          hourInput.value = hour.toString().padStart(2, "0")
        } else if (document.activeElement === minuteInput) {
          // Increment minute
          let minute = Number.parseInt(minuteInput.value || "0")
          minute = (minute + 1) % 60
          minuteInput.value = minute.toString().padStart(2, "0")
        }
      } else if (direction === "down") {
        if (document.activeElement === hourInput || !document.activeElement.classList.contains("time-number-input")) {
          // Decrement hour
          let hour = Number.parseInt(hourInput.value || "0")
          hour = (hour - 1 + 24) % 24
          hourInput.value = hour.toString().padStart(2, "0")
        } else if (document.activeElement === minuteInput) {
          // Decrement minute
          let minute = Number.parseInt(minuteInput.value || "0")
          minute = (minute - 1 + 60) % 60
          minuteInput.value = minute.toString().padStart(2, "0")
        }
      }
  
      updateHiddenTimeInputs()
    }
  
    function validateTimeInput(input) {
      const isHour = input.id.includes("Hour")
      const isMinute = input.id.includes("Minute")
  
      if (isHour) {
        let value = Number.parseInt(input.value || "0")
        if (isNaN(value) || value < 0) value = 0
        if (value > 23) value = 23
        input.value = value.toString().padStart(2, "0")
      } else if (isMinute) {
        let value = Number.parseInt(input.value || "0")
        if (isNaN(value) || value < 0) value = 0
        if (value > 59) value = 59
        input.value = value.toString().padStart(2, "0")
      }
    }
  
    function updateHiddenTimeInputs() {
      // Update arrival time
      const arrivalHour = document.getElementById("arrivalHour").value.padStart(2, "0")
      const arrivalMinute = document.getElementById("arrivalMinute").value.padStart(2, "0")
      document.getElementById("arrivalTime").value = `${arrivalHour}:${arrivalMinute}`
  
      // Update departure time
      const departureHour = document.getElementById("departureHour").value.padStart(2, "0")
      const departureMinute = document.getElementById("departureMinute").value.padStart(2, "0")
      document.getElementById("departureTime").value = `${departureHour}:${departureMinute}`
  
      // Update break 1 times
      const break1StartHour = document.getElementById("break1StartHour").value.padStart(2, "0")
      const break1StartMinute = document.getElementById("break1StartMinute").value.padStart(2, "0")
      document.getElementById("break1Start").value = `${break1StartHour}:${break1StartMinute}`
  
      const break1EndHour = document.getElementById("break1EndHour").value.padStart(2, "0")
      const break1EndMinute = document.getElementById("break1EndMinute").value.padStart(2, "0")
      document.getElementById("break1End").value = `${break1EndHour}:${break1EndMinute}`
  
      // Update break 2 times if visible
      if (!document.getElementById("break2Inputs").classList.contains("hidden")) {
        const break2StartHour = document.getElementById("break2StartHour").value.padStart(2, "0")
        const break2StartMinute = document.getElementById("break2StartMinute").value.padStart(2, "0")
        document.getElementById("break2Start").value = `${break2StartHour}:${break2StartMinute}`
  
        const break2EndHour = document.getElementById("break2EndHour").value.padStart(2, "0")
        const break2EndMinute = document.getElementById("break2EndMinute").value.padStart(2, "0")
        document.getElementById("break2End").value = `${break2EndHour}:${break2EndMinute}`
      }
  
      // Update break 3 times if visible
      if (!document.getElementById("break3Inputs").classList.contains("hidden")) {
        const break3StartHour = document.getElementById("break3StartHour").value.padStart(2, "0")
        const break3StartMinute = document.getElementById("break3StartMinute").value.padStart(2, "0")
        document.getElementById("break3Start").value = `${break3StartHour}:${break3StartMinute}`
  
        const break3EndHour = document.getElementById("break3EndHour").value.padStart(2, "0")
        const break3EndMinute = document.getElementById("break3EndMinute").value.padStart(2, "0")
        document.getElementById("break3End").value = `${break3EndHour}:${break3EndMinute}`
      }
    }
  
    function handleFormSubmit(e) {
      e.preventDefault()
  
      // Update hidden time inputs before submission
      updateHiddenTimeInputs()
  
      const formData = new FormData(timeEntryForm)
      const entryData = {
        date: formData.get("date"),
        isSchoolDay: formData.get("schoolDay") === "on",
        arrivalTime: formData.get("arrivalTime"),
        departureTime: formData.get("departureTime"),
        breaks: [],
      }
  
      if (!entryData.isSchoolDay) {
        // Validate required fields
        if (
          !entryData.arrivalTime ||
          !entryData.departureTime ||
          !formData.get("break1Start") ||
          !formData.get("break1End")
        ) {
          showSnackbar("Please fill in all required fields")
          return
        }
  
        // Add breaks
        if (formData.get("break1Start") && formData.get("break1End")) {
          entryData.breaks.push({
            start: formData.get("break1Start"),
            end: formData.get("break1End"),
          })
        }
  
        if (formData.get("break2Start") && formData.get("break2End")) {
          entryData.breaks.push({
            start: formData.get("break2Start"),
            end: formData.get("break2End"),
          })
        }
  
        if (formData.get("break3Start") && formData.get("break3End")) {
          entryData.breaks.push({
            start: formData.get("break3Start"),
            end: formData.get("break3End"),
          })
        }
      }
  
      // Calculate times
      const calculatedData = calculateTimes(entryData)
  
      // Save data
      saveTimeEntry(calculatedData)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Show summary
            displaySummary(calculatedData)
  
            // Reload current month's records
            const date = new Date(entryData.date)
            loadMonthRecords(date.getMonth(), date.getFullYear())
  
            // Show success message
            showSnackbar("Time entry saved successfully")
          } else {
            showSnackbar("Error saving time entry: " + data.message)
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          showSnackbar("Error saving time entry")
        })
    }
  
    function calculateTimes(entryData) {
      const result = { ...entryData }
  
      if (entryData.isSchoolDay) {
        // School day: 8 hours work, 45 min break
        result.totalWorkMinutes = 8 * 60
        result.totalBreakMinutes = 45
        result.overtimeMinutes = 0
      } else {
        // Calculate total work time
        const arrivalTime = parseTimeToMinutes(entryData.arrivalTime)
        const departureTime = parseTimeToMinutes(entryData.departureTime)
  
        // Calculate total break time
        let totalBreakMinutes = 0
        entryData.breaks.forEach((breakPeriod) => {
          const breakStart = parseTimeToMinutes(breakPeriod.start)
          const breakEnd = parseTimeToMinutes(breakPeriod.end)
          totalBreakMinutes += breakEnd - breakStart
        })
  
        // Ensure minimum 45 minutes break
        const effectiveBreakMinutes = Math.max(totalBreakMinutes, 45)
  
        // Calculate total work minutes (departure - arrival - breaks)
        const totalWorkMinutes = departureTime - arrivalTime - effectiveBreakMinutes
  
        // Calculate overtime/undertime (compared to 8 hours)
        const overtimeMinutes = totalWorkMinutes - 8 * 60
  
        result.totalWorkMinutes = totalWorkMinutes
        result.totalBreakMinutes = effectiveBreakMinutes
        result.actualBreakMinutes = totalBreakMinutes
        result.overtimeMinutes = overtimeMinutes
      }
  
      return result
    }
  
    function displaySummary(calculatedData) {
      totalWorkTimeSpan.textContent = formatMinutesToHoursAndMinutes(calculatedData.totalWorkMinutes)
      totalBreakTimeSpan.textContent = formatMinutesToHoursAndMinutes(calculatedData.totalBreakMinutes)
  
      const overtimeText = formatMinutesToHoursAndMinutes(Math.abs(calculatedData.overtimeMinutes))
      if (calculatedData.overtimeMinutes > 0) {
        overtimeUndertimeSpan.textContent = `+${overtimeText} (Overtime)`
        overtimeUndertimeSpan.className = "summary-value positive"
      } else if (calculatedData.overtimeMinutes < 0) {
        overtimeUndertimeSpan.textContent = `-${overtimeText} (Undertime)`
        overtimeUndertimeSpan.className = "summary-value negative"
      } else {
        overtimeUndertimeSpan.textContent = "None"
        overtimeUndertimeSpan.className = "summary-value"
      }
  
      summaryDiv.classList.remove("hidden")
    }
  
    function saveTimeEntry(entryData) {
      return fetch("/timecard/api/timecard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryData),
        credentials: "include",
      })
    }
  
    function loadMonthRecords(month, year) {
      fetch(`/timecard/api/timecard?month=${month + 1}&year=${year}`, {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          displayMonthRecords(data)
          updateMonthlyStats(data)
        })
        .catch((error) => {
          console.error("Error loading records:", error)
          showSnackbar("Error loading records")
        })
    }
  
    function displayMonthRecords(records) {
      timeRecordsBody.innerHTML = ""
  
      if (records.length === 0) {
        const row = document.createElement("tr")
        row.innerHTML = '<td colspan="8" style="text-align: center;">No records found for this month</td>'
        timeRecordsBody.appendChild(row)
        return
      }
  
      records.forEach((record) => {
        const row = document.createElement("tr")
  
        const date = new Date(record.date)
        const formattedDate = date.toLocaleDateString()
  
        let overtimeText = ""
        if (record.overtimeMinutes > 0) {
          overtimeText = `<span class="positive">+${formatMinutesToHoursAndMinutes(record.overtimeMinutes)}</span>`
        } else if (record.overtimeMinutes < 0) {
          overtimeText = `<span class="negative">-${formatMinutesToHoursAndMinutes(Math.abs(record.overtimeMinutes))}</span>`
        } else {
          overtimeText = "0"
        }
  
        row.innerHTML = `
                  <td>${formattedDate}</td>
                  <td>${record.isSchoolDay ? "-" : record.arrivalTime}</td>
                  <td>${record.isSchoolDay ? "-" : record.departureTime}</td>
                  <td>${formatMinutesToHoursAndMinutes(record.totalBreakMinutes)}</td>
                  <td>${formatMinutesToHoursAndMinutes(record.totalWorkMinutes)}</td>
                  <td>${overtimeText}</td>
                  <td>${record.isSchoolDay ? '<span class="material-icons" style="color: var(--secondary-color);">school</span>' : ""}</td>
                  <td>
                      <button class="action-btn" onclick="editRecord('${record.date}')">
                          <span class="material-icons">edit</span>
                      </button>
                      <button class="action-btn" onclick="deleteRecord('${record.date}')">
                          <span class="material-icons">delete</span>
                      </button>
                  </td>
              `
  
        timeRecordsBody.appendChild(row)
      })
    }
  
    function updateMonthlyStats(records) {
      let totalMinutes = 0
      const totalDays = records.length
      let totalOvertimeMinutes = 0
  
      records.forEach((record) => {
        totalMinutes += record.totalWorkMinutes
        if (record.overtimeMinutes > 0) {
          totalOvertimeMinutes += record.overtimeMinutes
        }
      })
  
      totalMonthlyHours.textContent = formatMinutesToHours(totalMinutes)
      totalMonthlyDays.textContent = totalDays
      totalMonthlyOvertime.textContent = formatMinutesToHours(totalOvertimeMinutes)
    }
  
    function navigateToPrevMonth() {
      let month = Number.parseInt(monthSelect.value)
      let year = Number.parseInt(yearSelect.value)
  
      month--
      if (month < 0) {
        month = 11
        year--
      }
  
      monthSelect.value = month
      yearSelect.value = year
  
      loadMonthRecords(month, year)
    }
  
    function navigateToNextMonth() {
      let month = Number.parseInt(monthSelect.value)
      let year = Number.parseInt(yearSelect.value)
  
      month++
      if (month > 11) {
        month = 0
        year++
      }
  
      monthSelect.value = month
      yearSelect.value = year
  
      loadMonthRecords(month, year)
    }
  
    function handleMonthYearChange() {
      const month = Number.parseInt(monthSelect.value)
      const year = Number.parseInt(yearSelect.value)
      loadMonthRecords(month, year)
    }
  
    function initializeMonthYearSelectors() {
      // Populate month selector
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
  
      months.forEach((month, index) => {
        const option = document.createElement("option")
        option.value = index
        option.textContent = month
        monthSelect.appendChild(option)
      })
  
      // Set current month
      monthSelect.value = today.getMonth()
  
      // Populate year selector (current year - 5 to current year + 5)
      const currentYear = today.getFullYear()
      for (let year = currentYear - 5; year <= currentYear + 5; year++) {
        const option = document.createElement("option")
        option.value = year
        option.textContent = year
        yearSelect.appendChild(option)
      }
  
      // Set current year
      yearSelect.value = currentYear
    }
  
    function createRipple(event) {
      const button = event.currentTarget
  
      const circle = document.createElement("span")
      const diameter = Math.max(button.clientWidth, button.clientHeight)
      const radius = diameter / 2
  
      circle.style.width = circle.style.height = `${diameter}px`
      circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`
      circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`
      circle.classList.add("ripple")
  
      const ripple = button.getElementsByClassName("ripple")[0]
  
      if (ripple) {
        ripple.remove()
      }
  
      button.appendChild(circle)
    }
  
    // Utility functions
    function parseTimeToMinutes(timeString) {
      const [hours, minutes] = timeString.split(":").map(Number)
      return hours * 60 + minutes
    }
  
    function formatMinutesToHoursAndMinutes(totalMinutes) {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${hours}h ${minutes}m`
    }
  
    function formatMinutesToHours(totalMinutes) {
      const hours = totalMinutes / 60
      return `${hours.toFixed(1)}h`
    }
  
    function formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }
  
    function showSnackbar(message) {
      const snackbar = document.getElementById("snackbar")
      const snackbarMessage = document.getElementById("snackbar-message")
      const snackbarAction = document.getElementById("snackbar-action")
  
      snackbarMessage.textContent = message
      snackbar.classList.add("visible")
  
      snackbarAction.addEventListener(
        "click",
        () => {
          snackbar.classList.remove("visible")
        },
        { once: true },
      )
  
      // Auto-hide after 5 seconds
      setTimeout(() => {
        snackbar.classList.remove("visible")
      }, 5000)
    }
  })
  
  // Global functions for edit and delete
  function editRecord(date) {
    fetch(`/timecard/api/timecard/${date}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((record) => {
        // Switch to time entry page
        const navItems = document.querySelectorAll(".nav-item")
        const pages = document.querySelectorAll(".page")
  
        navItems.forEach((item) => {
          if (item.getAttribute("data-page") === "time-entry") {
            item.classList.add("active")
          } else {
            item.classList.remove("active")
          }
        })
  
        pages.forEach((page) => {
          if (page.id === "time-entry-page") {
            page.classList.add("active")
          } else {
            page.classList.remove("active")
          }
        })
  
        // Fill the form with record data
        document.getElementById("date").value = record.date
        document.getElementById("schoolDay").checked = record.isSchoolDay
  
        if (!record.isSchoolDay) {
          document.getElementById("timeInputs").classList.remove("hidden")
  
          // Set arrival time
          if (record.arrivalTime) {
            const [arrivalHour, arrivalMinute] = record.arrivalTime.split(":")
            document.getElementById("arrivalHour").value = arrivalHour
            document.getElementById("arrivalMinute").value = arrivalMinute
            document.getElementById("arrivalTime").value = record.arrivalTime
          }
  
          // Set departure time
          if (record.departureTime) {
            const [departureHour, departureMinute] = record.departureTime.split(":")
            document.getElementById("departureHour").value = departureHour
            document.getElementById("departureMinute").value = departureMinute
            document.getElementById("departureTime").value = record.departureTime
          }
  
          // Fill break times if available
          if (record.breaks && record.breaks.length > 0) {
            if (record.breaks[0]) {
              const [break1StartHour, break1StartMinute] = record.breaks[0].start.split(":")
              document.getElementById("break1StartHour").value = break1StartHour
              document.getElementById("break1StartMinute").value = break1StartMinute
              document.getElementById("break1Start").value = record.breaks[0].start
  
              const [break1EndHour, break1EndMinute] = record.breaks[0].end.split(":")
              document.getElementById("break1EndHour").value = break1EndHour
              document.getElementById("break1EndMinute").value = break1EndMinute
              document.getElementById("break1End").value = record.breaks[0].end
            }
  
            if (record.breaks[1]) {
              // Show break 2 inputs
              const break2Inputs = document.getElementById("break2Inputs")
              break2Inputs.classList.remove("hidden")
              break2Inputs.classList.add("visible")
  
              // Update button
              const break2Btn = document.querySelector('[data-break="2"]')
              break2Btn.innerHTML = `
                <span class="material-icons">remove</span>
                <span class="toggle-text">Remove break</span>
              `
  
              const [break2StartHour, break2StartMinute] = record.breaks[1].start.split(":")
              document.getElementById("break2StartHour").value = break2StartHour
              document.getElementById("break2StartMinute").value = break2StartMinute
              document.getElementById("break2Start").value = record.breaks[1].start
  
              const [break2EndHour, break2EndMinute] = record.breaks[1].end.split(":")
              document.getElementById("break2EndHour").value = break2EndHour
              document.getElementById("break2EndMinute").value = break2EndMinute
              document.getElementById("break2End").value = record.breaks[1].end
            }
  
            if (record.breaks[2]) {
              // Show break 3 inputs
              const break3Inputs = document.getElementById("break3Inputs")
              break3Inputs.classList.remove("hidden")
              break3Inputs.classList.add("visible")
  
              // Update button
              const break3Btn = document.querySelector('[data-break="3"]')
              break3Btn.innerHTML = `
                <span class="material-icons">remove</span>
                <span class="toggle-text">Remove break</span>
              `
  
              const [break3StartHour, break3StartMinute] = record.breaks[2].start.split(":")
              document.getElementById("break3StartHour").value = break3StartHour
              document.getElementById("break3StartMinute").value = break3StartMinute
              document.getElementById("break3Start").value = record.breaks[2].start
  
              const [break3EndHour, break3EndMinute] = record.breaks[2].end.split(":")
              document.getElementById("break3EndHour").value = break3EndHour
              document.getElementById("break3EndMinute").value = break3EndMinute
              document.getElementById("break3End").value = record.breaks[2].end
            }
          }
        } else {
          document.getElementById("timeInputs").classList.add("hidden")
        }
  
        // Scroll to form
        document.querySelector(".time-entry-card").scrollIntoView({ behavior: "smooth" })
  
        // Show message
        showSnackbar("Editing record for " + new Date(record.date).toLocaleDateString())
      })
      .catch((error) => {
        console.error("Error loading record:", error)
        showSnackbar("Error loading record")
      })
  }
  
  function deleteRecord(date) {
    if (confirm("Are you sure you want to delete this record?")) {
      fetch(`/timecard/api/timecard/${date}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Reload current month's records
            const currentMonth = Number.parseInt(document.getElementById("monthSelect").value)
            const currentYear = Number.parseInt(document.getElementById("yearSelect").value)
            loadMonthRecords(currentMonth, currentYear)
  
            // Show success message
            showSnackbar("Record deleted successfully")
          } else {
            showSnackbar("Error deleting record: " + data.message)
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          showSnackbar("Error deleting record")
        })
    }
  }
  
  // Helper function for reloading records after edit/delete
  function loadMonthRecords(month, year) {
    fetch(`/timecard/api/timecard?month=${month + 1}&year=${year}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        const timeRecordsBody = document.getElementById("timeRecordsBody")
        timeRecordsBody.innerHTML = ""
  
        if (data.length === 0) {
          const row = document.createElement("tr")
          row.innerHTML = '<td colspan="8" style="text-align: center;">No records found for this month</td>'
          timeRecordsBody.appendChild(row)
          return
        }
  
        // Update monthly stats
        let totalMinutes = 0
        const totalDays = data.length
        let totalOvertimeMinutes = 0
  
        data.forEach((record) => {
          totalMinutes += record.totalWorkMinutes
          if (record.overtimeMinutes > 0) {
            totalOvertimeMinutes += record.overtimeMinutes
          }
        })
  
        document.getElementById("totalMonthlyHours").textContent = formatMinutesToHours(totalMinutes)
        document.getElementById("totalMonthlyDays").textContent = totalDays
        document.getElementById("totalMonthlyOvertime").textContent = formatMinutesToHours(totalOvertimeMinutes)
  
        data.forEach((record) => {
          const row = document.createElement("tr")
  
          const date = new Date(record.date)
          const formattedDate = date.toLocaleDateString()
  
          let overtimeText = ""
          if (record.overtimeMinutes > 0) {
            overtimeText = `<span class="positive">+${formatMinutesToHoursAndMinutes(record.overtimeMinutes)}</span>`
          } else if (record.overtimeMinutes < 0) {
            overtimeText = `<span class="negative">-${formatMinutesToHoursAndMinutes(Math.abs(record.overtimeMinutes))}</span>`
          } else {
            overtimeText = "0"
          }
  
          row.innerHTML = `
                      <td>${formattedDate}</td>
                      <td>${record.isSchoolDay ? "-" : record.arrivalTime}</td>
                      <td>${record.isSchoolDay ? "-" : record.departureTime}</td>
                      <td>${formatMinutesToHoursAndMinutes(record.totalBreakMinutes)}</td>
                      <td>${formatMinutesToHoursAndMinutes(record.totalWorkMinutes)}</td>
                      <td>${overtimeText}</td>
                      <td>${record.isSchoolDay ? '<span class="material-icons" style="color: var(--secondary-color);">school</span>' : ""}</td>
                      <td>
                          <button class="action-btn" onclick="editRecord('${record.date}')">
                              <span class="material-icons">edit</span>
                          </button>
                          <button class="action-btn" onclick="deleteRecord('${record.date}')">
                              <span class="material-icons">delete</span>
                          </button>
                      </td>
                  `
  
          timeRecordsBody.appendChild(row)
        })
      })
      .catch((error) => {
        console.error("Error loading records:", error)
        showSnackbar("Error loading records")
      })
  }
  
  function formatMinutesToHoursAndMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours}h ${minutes}m`
  }
  
  function formatMinutesToHours(totalMinutes) {
    const hours = totalMinutes / 60
    return `${hours.toFixed(1)}h`
  }
  
  function showSnackbar(message) {
    const snackbar = document.getElementById("snackbar")
    const snackbarMessage = document.getElementById("snackbar-message")
    const snackbarAction = document.getElementById("snackbar-action")
  
    snackbarMessage.textContent = message
    snackbar.classList.add("visible")
  
    snackbarAction.addEventListener(
      "click",
      () => {
        snackbar.classList.remove("visible")
      },
      { once: true },
    )
  
    // Auto-hide after 5 seconds
    setTimeout(() => {
      snackbar.classList.remove("visible")
    }, 5000)
  }
  