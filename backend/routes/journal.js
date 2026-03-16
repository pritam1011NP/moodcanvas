const express = require("express");
const Journal = require("../models/Journal");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { analyzeJournalEntry } = require("../controllers/aiController");

const router = express.Router();

// Create new journal entry
router.post("/", protect, async (req, res) => {
  try {
    const { content, title, tags, mood } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required." });

    // Create entry first
    const entry = await Journal.create({
      user: req.user._id,
      content,
      title: title || "",
      tags: tags || [],
      mood: mood || 5
    });

    // Run AI analysis async
    try {
      const { analysis, canvasColor } = await analyzeJournalEntry(content);
      entry.analysis = analysis;
      entry.canvasColor = canvasColor;
      entry.mood = analysis.moodScore || mood || 5;
      entry.isAnalyzed = true;
      await entry.save();
    } catch (aiErr) {
      console.error("AI analysis failed:", aiErr.message);
      // Entry still saved without analysis
    }

    // Update user streak and entry count
    const user = await User.findById(req.user._id);
    const today = new Date();
    const lastDate = user.lastJournalDate ? new Date(user.lastJournalDate) : null;
    const isConsecutiveDay =
      lastDate &&
      today.toDateString() !== lastDate.toDateString() &&
      (today - lastDate) / (1000 * 60 * 60 * 24) <= 1;

    user.totalEntries += 1;
    user.streak = isConsecutiveDay ? user.streak + 1 : 1;
    user.lastJournalDate = today;
    await user.save();

    res.status(201).json({ entry, streak: user.streak });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all entries (paginated)
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      Journal.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Journal.countDocuments({ user: req.user._id })
    ]);

    res.json({
      entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single entry
router.get("/:id", protect, async (req, res) => {
  try {
    const entry = await Journal.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ error: "Entry not found." });
    res.json({ entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update entry
router.put("/:id", protect, async (req, res) => {
  try {
    const { content, title, tags, mood } = req.body;
    const entry = await Journal.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ error: "Entry not found." });

    if (content) entry.content = content;
    if (title !== undefined) entry.title = title;
    if (tags) entry.tags = tags;
    if (mood) entry.mood = mood;

    // Re-analyze if content changed
    if (content) {
      try {
        const { analysis, canvasColor } = await analyzeJournalEntry(content);
        entry.analysis = analysis;
        entry.canvasColor = canvasColor;
        entry.isAnalyzed = true;
      } catch (aiErr) {
        console.error("AI re-analysis failed:", aiErr.message);
      }
    }

    await entry.save();
    res.json({ entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete entry
router.delete("/:id", protect, async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ error: "Entry not found." });

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalEntries: -1 } });
    res.json({ message: "Entry deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mood timeline (for chart)
router.get("/stats/timeline", protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const entries = await Journal.find({
      user: req.user._id,
      createdAt: { $gte: since }
    })
      .sort({ createdAt: 1 })
      .select("createdAt mood analysis.primaryEmotion analysis.sentimentScore canvasColor analysis.emotions")
      .lean();

    // Aggregate emotion frequency
    const emotionCounts = {};
    entries.forEach((e) => {
      const emotion = e.analysis?.primaryEmotion || "neutral";
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    res.json({ timeline: entries, emotionCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Re-analyze all entries (fix grey tiles)
router.post("/reanalyze-all", protect, async (req, res) => {
  try {
    const entries = await Journal.find({ user: req.user._id });
    let fixed = 0;
    for (const entry of entries) {
      try {
        const { analysis, canvasColor } = await analyzeJournalEntry(entry.content);
        entry.analysis = analysis;
        entry.canvasColor = canvasColor;
        entry.mood = analysis.moodScore || entry.mood;
        entry.isAnalyzed = true;
        await entry.save();
        fixed++;
        console.log("Re-analyzed:", entry._id, "->", analysis.primaryEmotion);
      } catch (e) {
        console.error("Failed:", entry._id, e.message);
      }
    }
    res.json({ message: "Re-analyzed " + fixed + " of " + entries.length + " entries." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
