// Load the dotenv module to access environment variables
require("dotenv").config();

// Import the Express.js framework
const express = require("express");

// Import the CORS middleware to enable cross-origin requests
const cors = require("cors");

// Create a new Express.js app
const app = express();

// Import the valid-url module to validate URLs
const validUrl = require("valid-url");

// Create an empty object to store the URL database
const urlDatabase = {};

// Set the port to use for the server, defaulting to 3000 if not set in environment variables
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies in requests
app.use(express.json());

// Parse URL-encoded bodies in requests
app.use(express.urlencoded({ extended: true }));

// Serve static files from the /public directory
app.use("/public", express.static(`${process.cwd()}/public`));

// Define a route for the root URL (/) that serves the index.html file
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Define a function to generate a short URL code
function generateShortUrlCode() {
  // Initialize an empty string to store the short URL code
  let shortUrlCode = "";
  // Define the possible characters for the short URL code
  const possibleChars = "0123456789";

  // Loop 6 times to generate a 6-character short URL code
  for (let i = 0; i < 6; i++) {
    // Append a random character from the possible characters to the short URL code
    shortUrlCode += possibleChars.charAt(
      Math.floor(Math.random() * possibleChars.length),
    );
  }

  // Check if the generated code already exists in the database
  if (urlDatabase[shortUrlCode]) {
    // If it does, generate a new code
    return generateShortUrlCode();
  }

  // Return the generated short URL code
  return shortUrlCode;
}

// Define a route for the /api/shorturl endpoint that creates a new short URL
app.post("/api/shorturl", function (req, res) {
  // Get the original URL from the request body
  const origUrl = req.body.url;

  // Check if the original URL is valid (includes http:// or https://)
  if (!origUrl.includes("http://") && !origUrl.includes("https://")) {
    // If not, return an error response
    return res.json({ error: "invalid url" });
  }

  // Generate a new short URL code
  let shortUrlCode = generateShortUrlCode();

  // Store the original URL in the database with the short URL code as the key
  urlDatabase[shortUrlCode] = req.body.url;

  // Return a JSON response with the original URL and short URL code
  res.json({ original_url: req.body.url, short_url: shortUrlCode });
});

// Define a route for the /api/shorturl/:shorturl endpoint that redirects to the original URL
app.get("/api/shorturl/:shorturl", (req, res) => {
  // Get the short URL code from the URL parameter
  const shortUrlCode = req.params.shorturl;

  // Check if the short URL code exists in the database
  if (urlDatabase[shortUrlCode]) {
    // If it does, redirect to the original URL
    res.redirect(urlDatabase[shortUrlCode]);
  } else {
    // If not, return a 404 error response
    res.status(404).send({ error: "Short URL not found" });
  }
});

// Start the server and listen on the specified port
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});