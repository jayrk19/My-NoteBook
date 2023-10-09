const express = require("express");
const router = express.Router();
const Notes = require("../models/Notes");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

// ROUTE 1: Fetch a note
router.get("/fetchAllNotes", fetchUser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id });
  res.status(200).json(notes);
});

// ROUTE 2: Add a new Note
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, description, tag } = req.body;

      const notes = await new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedUser = await notes.save();
      res.status(201).json(savedUser);
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error occurred, please try again later",
      });
    }
  }
);

// ROUTE 3: Update existing Notes
router.put("/updateNotes/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  let updatedNote = {};
  if (title) updatedNote.title = title;
  if (description) updatedNote.description = description;
  if (tag) updatedNote.tag = tag;

  try {
    let note = await Notes.findOne({ _id: req.params.id });
    if (!note) return res.status(404).json({ message: "Not Found" });

    if (note.user.toString() !== req.user.id) {
      return res.status(500).json({ message: "Bad Request" });
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: updatedNote },
      { new: true }
    );
    res.status(200).json({ note });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error occurred, please try again later",
    });
  }
});

// ROUTE 4: Delete existing Notes
router.delete("/deleteNotes/:id", fetchUser, async (req, res) => {
  try {
    let note = await Notes.findOne({ _id: req.params.id });
    if (!note) return res.status(404).json({ message: "Not Found" });

    if (note.user.toString() !== req.user.id) {
      return res.status(500).json({ message: "Bad Request" });
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Successfully Deleted" });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error occurred, please try again later",
    });
  }
});

module.exports = router;
