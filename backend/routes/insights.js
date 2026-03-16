const express = require("express");
const Journal = require("../models/Journal");
const { protect } = require("../middleware/auth");
const { generateWeeklyInsight } = require("../controllers/aiController");

const router = express.Router();

// Generate weekly AI insight report
router.get("/weekly", protect, async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const entries = await Journal.find({
      user: req.user._id,
      createdAt: { $gte: oneWeekAgo },
      isAnalyzed: true
    })
      .sort({ createdAt: 1 })
      .lean();

    if (entries.length === 0) {
      return res.json({
        report: null,
        message: "Write at least one journal entry this week to get your insight report."
      });
    }

    const report = await generateWeeklyInsight(entries);
    res.json({ report, entryCount: entries.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get emotion heatmap data (last 3 months)
router.get("/heatmap", protect, async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const entries = await Journal.find({
      user: req.user._id,
      createdAt: { $gte: threeMonthsAgo }
    })
      .select("createdAt mood analysis.primaryEmotion canvasColor")
      .lean();

    const heatmap = entries.map((e) => ({
      date: e.createdAt,
      mood: e.mood,
      emotion: e.analysis?.primaryEmotion || "neutral",
      color: e.canvasColor
    }));

    res.json({ heatmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get theme clusters
router.get("/themes", protect, async (req, res) => {
  try {
    const entries = await Journal.find({ user: req.user._id, isAnalyzed: true })
      .select("analysis.themes analysis.keywords createdAt")
      .lean();

    const themeCounts = {};
    entries.forEach((e) => {
      (e.analysis?.themes || []).forEach((theme) => {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      });
    });

    const sortedThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([theme, count]) => ({ theme, count }));

    res.json({ themes: sortedThemes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
