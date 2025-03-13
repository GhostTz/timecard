document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const usernameStep = document.getElementById("username-step")
    const passwordStep = document.getElementById("password-step")
    const createAccountStep = document.getElementById("create-account-step")
  
    const usernameInput = document.getElementById("username")
    const passwordInput = document.getElementById("password")
    const newUsernameInput = document.getElementById("new-username")
    const newPasswordInput = document.getElementById("new-password")
    const confirmPasswordInput = document.getElementById("confirm-password")
  
    const displayUsername = document.getElementById("display-username")
  
    const btnUsernameNext = document.getElementById("btn-username-next")
    const btnBackToUsername = document.getElementById("btn-back-to-username")
    const btnLogin = document.getElementById("btn-login")
    const btnBackToLogin = document.getElementById("btn-back-to-login")
    const btnCreateAccount = document.getElementById("btn-create-account")
  
    // Registration link is commented out in HTML, but we keep the reference in case it's needed later
    const createAccountLink = document.getElementById("create-account-link")
    const forgotPasswordLink = document.getElementById("forgot-password-link")
  
    const togglePassword = document.getElementById("toggle-password")
    const toggleNewPassword = document.getElementById("toggle-new-password")
  
    const usernameError = document.getElementById("username-error")
    const passwordError = document.getElementById("password-error")
    const createAccountError = document.getElementById("create-account-error")
  
    // Check if already logged in
    checkAuthStatus()
  
    // Input focus effects
    const inputs = document.querySelectorAll("input")
    inputs.forEach((input) => {
      // Add focus class to parent when input is focused
      input.addEventListener("focus", function () {
        this.parentElement.classList.add("focused")
      })
  
      // Remove focus class when input loses focus
      input.addEventListener("blur", function () {
        if (this.value === "") {
          this.parentElement.classList.remove("focused")
        }
      })
  
      // Check if input has value on page load
      if (input.value !== "") {
        input.parentElement.classList.add("focused")
      }
    })
  
    // Toggle password visibility
    togglePassword.addEventListener("click", function () {
      togglePasswordVisibility(passwordInput, this)
    })
  
    toggleNewPassword.addEventListener("click", function () {
      togglePasswordVisibility(newPasswordInput, this)
    })
  
    function togglePasswordVisibility(input, button) {
      const icon = button.querySelector(".material-icons")
  
      if (input.type === "password") {
        input.type = "text"
        icon.textContent = "visibility"
      } else {
        input.type = "password"
        icon.textContent = "visibility_off"
      }
    }
  
    // Username next button click
    btnUsernameNext.addEventListener("click", () => {
      const username = usernameInput.value.trim()
  
      if (username === "") {
        usernameError.textContent = "Please enter your username"
        return
      }
  
      // Check if username exists
      fetch(`/timecard/api/user/check?username=${encodeURIComponent(username)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.exists) {
            // Username exists, proceed to password step
            displayUsername.textContent = username
  
            // Animate transition
            usernameStep.classList.add("slide-out-left")
  
            setTimeout(() => {
              usernameStep.classList.add("hidden")
              passwordStep.classList.remove("hidden")
              passwordStep.classList.add("slide-in-right")
  
              setTimeout(() => {
                passwordStep.classList.remove("slide-in-right")
                usernameStep.classList.remove("slide-out-left")
                passwordInput.focus()
              }, 300)
            }, 300)
          } else {
            usernameError.textContent = "Username not found"
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          usernameError.textContent = "An error occurred. Please try again."
        })
    })
  
    // Back to username button click
    btnBackToUsername.addEventListener("click", () => {
      // Animate transition
      passwordStep.classList.add("slide-out-right")
  
      setTimeout(() => {
        passwordStep.classList.add("hidden")
        usernameStep.classList.remove("hidden")
        usernameStep.classList.add("slide-in-left")
  
        setTimeout(() => {
          usernameStep.classList.remove("slide-in-left")
          passwordStep.classList.remove("slide-out-right")
          usernameInput.focus()
        }, 300)
      }, 300)
    })
  
    // Login button click
    btnLogin.addEventListener("click", () => {
      const username = usernameInput.value.trim()
      const password = passwordInput.value
  
      if (password === "") {
        passwordError.textContent = "Please enter your password"
        return
      }
  
      // Show loading state
      btnLogin.disabled = true
      btnLogin.innerHTML = '<span class="material-icons spinning">refresh</span> Signing in...'
  
      // Attempt login
      fetch("/timecard/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Important for cookies
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Show success message
            showLoginMessage("Login successful! Redirecting...", true)
  
            // Redirect after a short delay
            setTimeout(() => {
              window.location.href = data.redirect ? `/timecard${data.redirect}` : "/timecard/timecard.html"
            }, 1000)
          } else {
            btnLogin.disabled = false
            btnLogin.innerHTML = "Sign in"
            passwordError.textContent = data.message || "Incorrect password"
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          btnLogin.disabled = false
          btnLogin.innerHTML = "Sign in"
          passwordError.textContent = "An error occurred. Please try again."
        })
    })
  
    // Create account link click - Commented out in HTML but kept in JS for future use
    if (createAccountLink) {
      createAccountLink.addEventListener("click", (e) => {
        e.preventDefault()
  
        // Animate transition
        usernameStep.classList.add("slide-out-left")
  
        setTimeout(() => {
          usernameStep.classList.add("hidden")
          createAccountStep.classList.remove("hidden")
          createAccountStep.classList.add("slide-in-right")
  
          setTimeout(() => {
            createAccountStep.classList.remove("slide-in-right")
            usernameStep.classList.remove("slide-out-left")
            newUsernameInput.focus()
          }, 300)
        }, 300)
      })
    }
  
    // Back to login button click
    btnBackToLogin.addEventListener("click", () => {
      // Animate transition
      createAccountStep.classList.add("slide-out-right")
  
      setTimeout(() => {
        createAccountStep.classList.add("hidden")
        usernameStep.classList.remove("hidden")
        usernameStep.classList.add("slide-in-left")
  
        setTimeout(() => {
          usernameStep.classList.remove("slide-in-left")
          createAccountStep.classList.remove("slide-out-right")
          usernameInput.focus()
        }, 300)
      }, 300)
    })
  
    // Create account button click
    btnCreateAccount.addEventListener("click", () => {
      const username = newUsernameInput.value.trim()
      const password = newPasswordInput.value
      const confirmPassword = confirmPasswordInput.value
  
      // Validate inputs
      if (username === "") {
        createAccountError.textContent = "Please enter a username"
        return
      }
  
      if (password === "") {
        createAccountError.textContent = "Please enter a password"
        return
      }
  
      if (password !== confirmPassword) {
        createAccountError.textContent = "Passwords do not match"
        return
      }
  
      // Show loading state
      btnCreateAccount.disabled = true
      btnCreateAccount.innerHTML = '<span class="material-icons spinning">refresh</span> Creating account...'
  
      // Check if username already exists
      fetch(`/timecard/api/user/check?username=${encodeURIComponent(username)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.exists) {
            btnCreateAccount.disabled = false
            btnCreateAccount.innerHTML = "Create account"
            createAccountError.textContent = "Username already exists"
          } else {
            // Create new account
            fetch("/timecard/api/user/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ username, password }),
              credentials: "include", // Important for cookies
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  // Show success message
                  showRegistrationMessage("Account created successfully! Redirecting...", true)
  
                  // Redirect after a short delay
                  setTimeout(() => {
                    window.location.href = data.redirect ? `/timecard${data.redirect}` : "/timecard/timecard.html"
                  }, 1000)
                } else {
                  btnCreateAccount.disabled = false
                  btnCreateAccount.innerHTML = "Create account"
                  createAccountError.textContent = data.message || "Failed to create account"
                }
              })
              .catch((error) => {
                console.error("Error:", error)
                btnCreateAccount.disabled = false
                btnCreateAccount.innerHTML = "Create account"
                createAccountError.textContent = "An error occurred. Please try again."
              })
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          btnCreateAccount.disabled = false
          btnCreateAccount.innerHTML = "Create account"
          createAccountError.textContent = "An error occurred. Please try again."
        })
    })
  
    // Enter key functionality
    usernameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        btnUsernameNext.click()
      }
    })
  
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        btnLogin.click()
      }
    })
  
    // Forgot password link click (placeholder functionality)
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault()
      alert("Password reset functionality would be implemented here.")
    })
  
    // Focus the username input on page load
    usernameInput.focus()
  
    // Helper functions
    function checkAuthStatus() {
      const baseUrl = window.location.origin + "/timecard"
      console.log("Base URL:", baseUrl)
      console.log("Checking auth status with absolute URL:", baseUrl + "/api/user/status")
  
      fetch(baseUrl + "/api/user/status", {
        credentials: "include", // Important for cookies
      })
        .then((response) => {
          console.log("Response status:", response.status)
          return response.json()
        })
        .then((data) => {
          console.log("Auth data received:", data)
          if (data.authenticated) {
            // Already logged in, redirect to timecard
            window.location.href = baseUrl + "/timecard.html"
          }
        })
        .catch((error) => {
          console.error("Error checking auth status:", error)
        })
    }
  
    function showLoginMessage(message, isSuccess) {
      const messageElement = document.createElement("div")
      messageElement.className = `login-message ${isSuccess ? "success" : "error"}`
      messageElement.innerHTML = `
        <span class="material-icons">${isSuccess ? "check_circle" : "error"}</span>
        <span>${message}</span>
      `
  
      // Insert after the form
      passwordStep.appendChild(messageElement)
  
      // Animate in
      setTimeout(() => {
        messageElement.classList.add("visible")
      }, 10)
    }
  
    function showRegistrationMessage(message, isSuccess) {
      const messageElement = document.createElement("div")
      messageElement.className = `login-message ${isSuccess ? "success" : "error"}`
      messageElement.innerHTML = `
        <span class="material-icons">${isSuccess ? "check_circle" : "error"}</span>
        <span>${message}</span>
      `
  
      // Insert after the form
      createAccountStep.appendChild(messageElement)
  
      // Animate in
      setTimeout(() => {
        messageElement.classList.add("visible")
      }, 10)
    }
  })
  
  