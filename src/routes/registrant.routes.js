const express = require("express");
const { body } = require("express-validator");
const upload = require("../middleware/upload");
const adminAuth = require("../middleware/adminAuth");
const {
  signup,
  listRegistrants,
  listAllRegistrants,
  getRegistrant,
} = require("../controllers/registrant.controller");

const router = express.Router();

const signupValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("phoneNumber")
    .trim()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage("A valid phone number is required"),
  body("conference")
    .trim()
    .notEmpty()
    .withMessage("Conference (parish) is required"),
];

router.post("/signup", upload.single("photo"), signupValidation, signup);

router.get("/all", listAllRegistrants);
router.get("/", adminAuth, listRegistrants);
router.get("/:id", adminAuth, getRegistrant);

module.exports = router;
