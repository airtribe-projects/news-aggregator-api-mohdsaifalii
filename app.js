require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const verifyTokenMiddleware = require("./Routes/verifyToken");
const authTokenMiddleware = require("./Routes/authenticateToken");
const axios = require("axios");
const apiKey = process.env.API_KEY;

const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(verifyTokenMiddleware);
app.use(authTokenMiddleware);

let users = [];

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Username already taken" });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = { username, email, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({ message: "User registered successfully" });
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate JWT token if login is successful
    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", // Token expires in 1 hour
      }
    );

    // Send response with the token
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/preferences", async (req, res) => {
  try {
    const userId = req.user.id;
    const { categories, languages } = req.body;

    let preferences = await Preference.findOne({ userId });
    if (!preferences) {
      preferences = new Preference({ userId, categories, languages });
    } else {
      preferences.categories = categories;
      preferences.languages = languages;
    }

    await preferences.save();
    res.json(preferences);
  } catch (error) {
    res.status(500).send("Server error");
  }
});
axios
  .get(
    "https://newsapi.org/v2/everything?q=apple&from=2024-10-12&to=2024-10-12&sortBy=popularity&apiKey=145e971aaaa641e0a6f1949eb0c4a16c"
  )
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
async function fetchnews(params) {
  const response = await axios.get(
    `https://newsapi.org/v2/everything?q=apple&from=2024-10-12&to=2024-10-12&sortBy=popularity&apiKey=145e971aaaa641e0a6f1949eb0c4a16c`
  );
  const data = response.data.articles;
  return data;
}

app.listen(PORT, (err) => {
  if (err) {
    return console.log("Something bad happened:", err);
  }
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
