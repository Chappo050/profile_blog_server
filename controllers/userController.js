const { mongo, default: mongoose } = require("mongoose");
const User = require("../models/user.js");
const Post = require("../models/post.js");
const { DateTime } = require("luxon");
const bcrypt = require('bcrypt');
const { body, validationResult } = require("express-validator"); //Data parsing
const passport = require("passport");

// Display list of all User.
exports.init = (req, res, next) => {
  res.json({ Message: "Hello, welcome to the users page" });
};

// Display list of all User.
exports.register_new_user = [
  //Trim data
  //Add extra data validation
  body("username", "User name required").trim().isLength({ min: 1 }).escape(),
  body("email", "Email is required").trim().isLength({ min: 1 }).escape(),
  body("password", "Longer password is required").trim().isLength({ min: 6 }).escape(),

  // Process request after validation and sanitization.
  async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

      const hashedPassword = await bcrypt.hash(req.body.password, 10)

      const user = new User(
        {
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
          date_registered: Date.now(),
        }
      );

    if (!errors.isEmpty()) {
      // There are errors. Return data and erros as JSON
      res.json({
        user,
        errors: errors.array(),
      });
      return;
    } else {

      // Data from form is valid.
      // Check if User with same name already exists.
      User.findOne({ username: req.body.username }).exec((err, found_message_copy) => {
        if (err) {
          return next(err);
        }

        if (found_message_copy) {
          // User exists
          res.json({message: "Username already exists."});
        } else {
          user.save((err) => {
            if (err) {
              return next(err);
            }
            res.json({message: "User successfully added to database"});
          });
        }
      });
    }
  },
];

exports.create_new_post = [
//Trim data
  //Add extra data validation
  body("message", "Please enter a message").trim().isLength({ min: 1 }).escape(),
  body("isPublic", "Public by default").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a post object with escaped and trimmed data.
    
    const current_time = Date.now()

    const post = new Post(
      {
        user_details: req.params.userId,
        message: req.body.message,
        post_time: current_time,
        public: req.body.isPublic,
      }

    );

    if (!errors.isEmpty()) {
      // There are errors. Return data and erros as JSON
      res.json({
        user,
        errors: errors.array(),
      });
      return;
    } else {

      // Data from form is valid.
      // Check if post with same date/time by user already exists.
      Post.findOne({ username: req.body.message, post_time: current_time }).exec((err, found_message_copy) => {
        if (err) {
          return next(err);
        }

        if (found_message_copy) {
          // Post exists.
          res.json({message: "Post already exists."});
        } else {
          post.save((err) => {
            if (err) {
              return next(err);
            }
            res.json({message: "Post successfully added to database"});
          });
        }
      });
    }
  },


]

exports.user_login_post =  (req, res, next) => {
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            return res.status(400).json({ errors: err });
        }
        if (!user) {
            return res.status(400).json({ errors: "No user found" });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(400).json({ errors: err });
            }
            return res.status(200).json({ success: `logged in ${user.id}` });
        });
    })(req, res, next);
}

exports.user_login_get = (req,res, next) => {
  res.json({ Message: "Hello, welcome to the users login page :). Please sign in" });
}
