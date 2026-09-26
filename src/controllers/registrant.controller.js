const { validationResult } = require("express-validator");
const Registrant = require("../models/Registrant");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const generateTicketId = require("../utils/generateTicketId");

const signup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(
      400,
      errors
        .array()
        .map((e) => e.msg)
        .join(", "),
    );
  }

  const { fullName, email, phoneNumber, conference } = req.body;

  const existing = await Registrant.findOne({
    $or: [{ email: email.toLowerCase() }, { phoneNumber }],
  });
  if (existing) {
    throw new ApiError(
      409,
      "A registrant with this email or phone number already exists",
    );
  }

  let photoUrl = null;
  let photoPublicId = null;
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    photoUrl = result.secure_url;
    photoPublicId = result.public_id;
  }

  let ticketId;
  do {
    ticketId = generateTicketId();
    // eslint-disable-next-line no-await-in-loop
  } while (await Registrant.exists({ ticketId }));

  const registrant = await Registrant.create({
    fullName,
    email,
    phoneNumber,
    conference,
    photoUrl,
    photoPublicId,
    ticketId,
  });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: registrant,
  });
});

const listRegistrants = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const { search, conference } = req.query;

  const filter = {};
  if (conference) {
    filter.conference = new RegExp(conference, "i");
  }
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { fullName: regex },
      { email: regex },
      { phoneNumber: regex },
    ];
  }

  const [registrants, total] = await Promise.all([
    Registrant.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Registrant.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: registrants,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

const listAllRegistrants = asyncHandler(async (req, res) => {
  const [registrants, total] = await Promise.all([
    Registrant.find().sort({ createdAt: -1 }),
    Registrant.countDocuments(),
  ]);

  res.json({
    success: true,
    total,
    data: registrants,
  });
});

const getRegistrant = asyncHandler(async (req, res) => {
  const registrant = await Registrant.findById(req.params.id);
  if (!registrant) {
    throw new ApiError(404, "Registrant not found");
  }
  res.json({ success: true, data: registrant });
});

module.exports = { signup, listRegistrants, listAllRegistrants, getRegistrant };
