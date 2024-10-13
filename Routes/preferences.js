const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const validateJWT = require("../Middlewares/ValidateJWT");
const NEWSAPI = require("newsapi");
const { default: mongoose } = require("mongoose");
const Newsapikey = new NEWSAPI(process.env.API_KEY);

/* To update the Preferences */

router.put("/", validateJWT, async (req, res, next) => {
  try {
    const { categories, languages, country } = req.body.preferences;

    const user = await User.findOne({ email: req.user.email });
    console.log("User from token:", req.user);

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    if (!user.preferences) {
      user.preferences = {};
    }

    if (categories) {
      user.preferences.categories = categories;
    }
    if (languages) {
      user.preferences.languages = languages;
    }

    if (country) {
      user.preferences.country = country;
    }

    Newsapikey.v2.sources({
      category: categories,
      language: languages,
      country: country,
    });
    console.log(
      "languages:",
      languages,
      "categories:",
      categories,
      "country:",
      country
    );

    await user.save();

    if (user.preferences) {
      return res
        .status(201)
        .send({ message: "User Preferences Updated Successfully" });
    } else {
      return res.status(505).send({ message: "Updation error " });
    }
  } catch (err) {
    console.log(err);
    next(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

/* to get the user preferences */
router.get("/", validateJWT, async (req, res) => {
  try {
    const user = await User.find({ email: req.user.email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({ user });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
