const express = require("express")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const session = require("express-session")
const FileStore = require("session-file-store")(session)
const app = express()
const PORT = process.env.PORT || 3000

// Ensure data directory exists
const dataDir = path.join(__dirname, "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir)
}

// Session configuration
const sessionOptions = {
  store: new FileStore({
    path: path.join(dataDir, "sessions"),
    ttl: 86400, // 1 day in seconds
    retries: 0,
  }),
  secret: "timecard-secret-key", // Use a fixed secret instead of random for persistence
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true only in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}

// Middleware
app.use(express.json())
app.use("/timecard", express.static(path.join(__dirname)))
app.use(express.static(path.join(__dirname)))
app.use(session(sessionOptions))

// Authentication middleware
const requireAuth = (req, res, next) => {
  console.log("Auth check - Session:", req.session.id, "User:", req.session.user ? req.session.user.username : "none")

  if (!req.session.user) {
    return res.status(401).json({ authenticated: false, message: "Authentication required" })
  }
  next()
}

// Routes
app.get("/", (req, res) => {
  res.redirect("/timecard")
})

app.get("/timecard", (req, res) => {
  console.log(
    "Timecard route - Session:",
    req.session.id,
    "User:",
    req.session.user ? req.session.user.username : "none",
  )

  if (req.session.user) {
    res.redirect("/timecard/timecard.html")
  } else {
    res.redirect("/timecard/login.html")
  }
})

// User API Routes
app.get("/timecard/api/user/status", (req, res) => {
  console.log("Status check - Session:", req.session.id, "User:", req.session.user ? req.session.user.username : "none")

  if (req.session.user) {
    res.json({
      authenticated: true,
      username: req.session.user.username,
    })
  } else {
    res.json({ authenticated: false })
  }
})

app.get("/timecard/api/user/check", (req, res) => {
  const username = req.query.username

  if (!username) {
    return res.status(400).json({ error: "Username is required" })
  }

  try {
    const users = getAllUsers()
    const userExists = users.some((user) => user.username.toLowerCase() === username.toLowerCase())

    res.json({ exists: userExists })
  } catch (error) {
    console.error("Error checking username:", error)
    res.status(500).json({ error: "Failed to check username" })
  }
})

app.post("/timecard/api/user/login", (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" })
  }

  try {
    const users = getAllUsers()
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase())

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid username or password" })
    }

    // Hash the provided password with the stored salt
    const hashedPassword = hashPassword(password, user.salt)

    if (hashedPassword === user.password) {
      // Set user session
      req.session.user = {
        id: user.id,
        username: user.username,
      }

      console.log("Login successful - User:", username, "Session:", req.session.id)

      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err)
          return res.status(500).json({ success: false, message: "Session error" })
        }

        console.log("Session saved successfully")
        return res.json({ success: true, redirect: "/timecard.html" })
      })
    } else {
      res.status(401).json({ success: false, message: "Invalid username or password" })
    }
  } catch (error) {
    console.error("Error during login:", error)
    res.status(500).json({ success: false, message: "Login failed" })
  }
})

app.post("/timecard/api/user/register", (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" })
  }

  try {
    const users = getAllUsers()

    // Check if username already exists
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Username already exists" })
    }

    // Generate a random salt
    const salt = crypto.randomBytes(16).toString("hex")

    // Hash the password with the salt
    const hashedPassword = hashPassword(password, salt)

    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      username,
      password: hashedPassword,
      salt,
      createdAt: new Date().toISOString(),
    }

    // Add user to users list
    users.push(newUser)
    saveAllUsers(users)

    // Set user session
    req.session.user = {
      id: newUser.id,
      username: newUser.username,
    }

    console.log("Registration successful - User:", username, "Session:", req.session.id)

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err)
        return res.status(500).json({ success: false, message: "Session error" })
      }

      console.log("Session saved successfully")
      return res.json({ success: true, redirect: "/timecard.html" })
    })
  } catch (error) {
    console.error("Error during registration:", error)
    res.status(500).json({ success: false, message: "Registration failed" })
  }
})

app.post("/timecard/api/user/logout", (req, res) => {
  const username = req.session.user ? req.session.user.username : "unknown"
  console.log("Logout attempt - User:", username, "Session:", req.session.id)

  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).json({ success: false, message: "Logout failed" })
    }

    console.log("Logout successful - User:", username)
    res.json({ success: true })
  })
})

// Debug route
app.get("/timecard/api/debug/session", (req, res) => {
  res.json({
    sessionExists: req.session ? true : false,
    sessionID: req.sessionID,
    userInSession: req.session.user ? true : false,
    user: req.session.user
      ? {
          id: req.session.user.id,
          username: req.session.user.username,
        }
      : null,
    cookie: req.session.cookie
      ? {
          maxAge: req.session.cookie.maxAge,
          httpOnly: req.session.cookie.httpOnly,
          secure: req.session.cookie.secure,
        }
      : null,
  })
})

// Timecard API Routes
app.get("/timecard/api/timecard", requireAuth, (req, res) => {
  const month = Number.parseInt(req.query.month)
  const year = Number.parseInt(req.query.year)

  if (isNaN(month) || isNaN(year)) {
    return res.status(400).json({ error: "Invalid month or year" })
  }

  try {
    const records = getTimeRecords(req.session.user.id)

    // Filter records for the specified month and year
    const filteredRecords = records.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() + 1 === month && recordDate.getFullYear() === year
    })

    // Sort by date
    filteredRecords.sort((a, b) => new Date(a.date) - new Date(b.date))

    res.json(filteredRecords)
  } catch (error) {
    console.error("Error reading records:", error)
    res.status(500).json({ error: "Failed to read records" })
  }
})

app.get("/timecard/api/timecard/:date", requireAuth, (req, res) => {
  const date = req.params.date

  try {
    const records = getTimeRecords(req.session.user.id)
    const record = records.find((r) => r.date === date)

    if (!record) {
      return res.status(404).json({ error: "Record not found" })
    }

    res.json(record)
  } catch (error) {
    console.error("Error reading record:", error)
    res.status(500).json({ error: "Failed to read record" })
  }
})

app.post("/timecard/api/timecard", requireAuth, (req, res) => {
  const entryData = req.body

  if (!entryData.date) {
    return res.status(400).json({ success: false, message: "Date is required" })
  }

  try {
    const records = getTimeRecords(req.session.user.id)

    // Check if record already exists for this date
    const existingIndex = records.findIndex((r) => r.date === entryData.date)

    if (existingIndex !== -1) {
      // Update existing record
      records[existingIndex] = entryData
    } else {
      // Add new record
      records.push(entryData)
    }

    // Save all records
    saveTimeRecords(req.session.user.id, records)

    res.status(200).json({ success: true, message: "Record saved successfully" })
  } catch (error) {
    console.error("Error saving record:", error)
    res.status(500).json({ success: false, message: "Failed to save record" })
  }
})

app.delete("/timecard/api/timecard/:date", requireAuth, (req, res) => {
  const date = req.params.date

  try {
    let records = getTimeRecords(req.session.user.id)

    // Filter out the record to delete
    records = records.filter((r) => r.date !== date)

    // Save updated records
    saveTimeRecords(req.session.user.id, records)

    res.status(200).json({ success: true, message: "Record deleted successfully" })
  } catch (error) {
    console.error("Error deleting record:", error)
    res.status(500).json({ success: false, message: "Failed to delete record" })
  }
})

// Helper functions
function getAllUsers() {
  const filePath = path.join(dataDir, "users.json")

  if (!fs.existsSync(filePath)) {
    return []
  }

  const data = fs.readFileSync(filePath, "utf8")
  return JSON.parse(data)
}

function saveAllUsers(users) {
  const filePath = path.join(dataDir, "users.json")
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf8")
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
}

function getTimeRecords(userId) {
  const filePath = path.join(dataDir, `timecard-${userId}.json`)

  if (!fs.existsSync(filePath)) {
    return []
  }

  const data = fs.readFileSync(filePath, "utf8")
  return JSON.parse(data)
}

function saveTimeRecords(userId, records) {
  const filePath = path.join(dataDir, `timecard-${userId}.json`)
  fs.writeFileSync(filePath, JSON.stringify(records, null, 2), "utf8")
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Serve static files from the root directory under /timecard
app.use("/timecard", express.static(path.join(__dirname)))

// Serve the application at /timecard
app.get("/timecard", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "timecard.html"))
  } else {
    res.sendFile(path.join(__dirname, "login.html"))
  }
})

// Redirect root to /timecard
app.get("/", (req, res) => {
  res.redirect("/timecard")
})

// Make sure all API routes are prefixed with /timecard
app.use("/timecard/api", express.json())

