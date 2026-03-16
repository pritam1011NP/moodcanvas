const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    content: {
      type: String,
      required: [true, "Journal content is required"],
      minlength: [10, "Entry must be at least 10 characters"],
      maxlength: [5000, "Entry cannot exceed 5000 characters"]
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
      default: ""
    },
    // AI Analysis Results
    analysis: {
      primaryEmotion: {
        type: String,
        enum: ["joy", "sadness", "anger", "fear", "surprise", "disgust", "anticipation", "trust", "neutral"],
        default: "neutral"
      },
      emotionIntensity: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
      },
      sentimentScore: {
        type: Number,
        min: -1,
        max: 1,
        default: 0
      },
      emotions: {
        joy: { type: Number, default: 0 },
        sadness: { type: Number, default: 0 },
        anger: { type: Number, default: 0 },
        fear: { type: Number, default: 0 },
        surprise: { type: Number, default: 0 },
        disgust: { type: Number, default: 0 },
        anticipation: { type: Number, default: 0 },
        trust: { type: Number, default: 0 }
      },
      themes: [{ type: String }],
      keywords: [{ type: String }],
      summary: { type: String, default: "" },
      aiReflection: { type: String, default: "" },
      energyLevel: {
        type: String,
        enum: ["very_low", "low", "medium", "high", "very_high"],
        default: "medium"
      }
    },
    // Visual canvas color generated from emotion
    canvasColor: {
      type: String,
      default: "#6B7280"
    },
    mood: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    tags: [{ type: String, maxlength: 30 }],
    isAnalyzed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index for timeline queries
journalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Journal", journalSchema);
