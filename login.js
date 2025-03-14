document.addEventListener("DOMContentLoaded", () => {
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
  
    const createAccountLink = document.getElementById("create-account-link")
    const forgotPasswordLink = document.getElementById("forgot-password-link")
  
    const togglePassword = document.getElementById("toggle-password")
    const toggleNewPassword = document.getElementById("toggle-new-password")
  
    const usernameError = document.getElementById("username-error")
    const passwordError = document.getElementById("password-error")
    const createAccountError = document.getElementById("create-account-error")
  
    checkAuthStatus()
  
    const inputs = document.querySelectorAll("input")
    inputs.forEach((input) => {
      input.addEventListener("focus", function () {
        this.parentElement.classList.add("focused")
      })
  
      input.addEventListener("blur", function () {
        if (this.value === "") {
          this.parentElement.classList.remove("focused")
        }
      })
  
      if (input.value !== "") {
        input.parentElement.classList.add("focused")
      }
    })
  
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
  
    btnUsernameNext.addEventListener("click", () => {
      const username = usernameInput.value.trim()
  
      if (username === "") {
        usernameError.textContent = "Please enter your username"
        return
      }
  
      fetch(`/timecard/api/user/check?username=${encodeURIComponent(username)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.exists) {
            displayUsername.textContent = username
  
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
  
    btnBackToUsername.addEventListener("click", () => {
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
  
    btnLogin.addEventListener("click", () => {
      const username = usernameInput.value.trim()
      const password = passwordInput.value
  
      if (password === "") {
        passwordError.textContent = "Please enter your password"
        return
      }
  
      btnLogin.disabled = true
      btnLogin.innerHTML = '<span class="material-icons spinning">refresh</span> Signing in...'
  
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
            showLoginMessage("Login successful! Redirecting...", true)
  
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
  
    if (createAccountLink) {
      createAccountLink.addEventListener("click", (e) => {
        e.preventDefault()
  
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
  
    btnBackToLogin.addEventListener("click", () => {
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
  
    btnCreateAccount.addEventListener("click", () => {
      const username = newUsernameInput.value.trim()
      const password = newPasswordInput.value
      const confirmPassword = confirmPasswordInput.value
  
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
  
      btnCreateAccount.disabled = true
      btnCreateAccount.innerHTML = '<span class="material-icons spinning">refresh</span> Creating account...'
  
      fetch(`/timecard/api/user/check?username=${encodeURIComponent(username)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.exists) {
            btnCreateAccount.disabled = false
            btnCreateAccount.innerHTML = "Create account"
            createAccountError.textContent = "Username already exists"
          } else {
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
                  showRegistrationMessage("Account created successfully! Redirecting...", true)
  
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
  
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault()
      alert("Password reset functionality would be implemented here.")
    })
  
    usernameInput.focus()
  
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
  
      passwordStep.appendChild(messageElement)
  
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
  
      createAccountStep.appendChild(messageElement)
  
      setTimeout(() => {
        messageElement.classList.add("visible")
      }, 10)
    }
  })
  
  