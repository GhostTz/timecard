# Time Tracker

## Description

Time Tracker is a web application for recording and managing working hours. The application allows users to record their daily working hours including breaks and provides a monthly overview of hours worked.

## Features

- User authentication (login)
- Recording of working hours (arrival, departure)
- Break management
- Option for school days with automatic 8-hour recording
- Monthly overview of working hours
- Calculation of overtime
- Responsive design for desktop and mobile

## Technologies

- HTML5, CSS3, JavaScript
- Node.js
- Express.js
- Session-based authentication
- Data storage in JSON files

## Detailed Installation Guide

### 1. Installing Node.js and npm

1. Visit the official Node.js website: https://nodejs.org/
2. Download the LTS version (Long Term Support)
3. Run the downloaded installation file
4. Follow the instructions of the installation wizard
   - Click "Next" for all standard options
   - Accept the license agreement
   - Choose the installation location (keep default)
   - Click "Install"
5. Verify the installation by opening a command line window:
   - Windows: Press `Win + R`, type `cmd` and press Enter
   - Mac: Open the Terminal program
   - Linux: Open a terminal
6. Enter the following commands and press Enter after each:
   
   node --version
   npm --version
   
   Version numbers should be displayed (e.g., v16.15.0 and 8.5.5)

### 2. Downloading the Project

#### Option A: With Git (recommended)

1. Install Git if not already installed:
   - Windows: https://git-scm.com/download/win
   - Mac: https://git-scm.com/download/mac
   - Linux: Use your package manager (e.g., `sudo apt install git`)

2. Open a command line window (as described above)

3. Navigate to the directory where you want to save the project:
   - Windows: `cd C:\path\to\directory`
   - Mac/Linux: `cd /path/to/directory`

4. Clone the repository:
   
   `git clone https://github.com/GhostTz/timecard`
   

5. Change to the project directory:
   
   `cd time-tracker`
   

#### Option B: Download as ZIP file

1. Visit the GitHub page of the project
2. Click on the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file to a folder of your choice
5. Open a command line window
6. Navigate to the extracted project folder:
   - Windows: `cd C:\path\to\extracted\folder`
   - Mac/Linux: `cd /path/to/extracted/folder`

### 3. Installing Required Packages

1. Make sure you are in the project directory
2. Run the following command to install all needed packages:
   
   `npm install`
   
3. Wait until the installation is complete. This may take a few minutes.
4. You should see a message that packages were installed, without error messages

### 4. Starting the Server

1. Run the following command in the project directory:
   
   `node server.js`
   

2. You should see a message: `Server running on port 3000`

3. Keep this window open as long as you want to use the application

### 5. Accessing the Application

1. Open a web browser (Chrome, Firefox, Edge, Safari, etc.)

2. Enter the following address in the address bar:
   
   http://localhost:3000/timecard
   

3. The login page of the application should appear

### 6. Creating a User Account

Since the registration function is commented out by default, you need to perform one of the following steps:

#### Option A: Activating the Registration Function

1. Open the file `html/login.html` in a text editor
2. Find the commented section with the registration link (around line 45-47)
3. Remove the comment characters `<!--` and `-->` around this section
4. Save the file
5. Restart the server (terminate it with Ctrl+C and restart it with `node server.js`)
6. Now you can click on "Create account" on the login page and register a user

#### Option B: Manually Creating a User

1. Create a file named `users.json` in the `data` directory
2. Add the following content (replace "username" and "password" with your desired values):
   
   [
     {
       "id": "1",
       "username": "testuser",
       "password": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
       "salt": "0123456789abcdef",
       "createdAt": "2023-01-01T00:00:00.000Z"
     }
   ]
   
   Note: The above password is "password" (without quotation marks)

### Troubleshooting

#### The Server Does Not Start

- Check if Node.js is correctly installed
- Make sure you are in the correct directory
- Check if all packages are installed (`npm install`)
- Check if port 3000 is already in use:
  - Windows: `netstat -ano | findstr :3000`
  - Mac/Linux: `lsof -i :3000`
  - If the port is occupied, change the port number in `server.js` (e.g., to 3001)

#### Login Does Not Work

- Make sure the `data/users.json` file exists and is correctly formatted
- Check if the `data` directory has write permissions
- Check the console output for error messages

#### Time Entries Are Not Saved

- Check if the `data` directory has write permissions
- Make sure you are logged in
- Check the console output for error messages

## Usage

### Time Recording

1. Log in with your credentials
2. Select the date
3. Activate the "School Day" option if it is a school day (automatically 8 hours)
4. Or enter your arrival and departure time as well as breaks
5. Click on "Save Entry"

### Monthly Overview

1. Click on "Time Overview" in the navigation menu
2. Select the desired month and year
3. View your recorded times and statistics

## Customization

You can customize the color scheme by changing the CSS variables in the CSS files:
```css
:root {
  --primary-color: #5b21b6; /* Main color */
  --primary-light: #ddd6fe;
  --primary-dark: #4c1d95;
  /* more colors... */
}
```

## License and Credits

This project is available for free use. You may copy, modify, and adapt it for your own purposes.

**Important:** If you use this code, please give credit to the original author (me :D) by including a link to this repository in your documentation or in the code itself.
