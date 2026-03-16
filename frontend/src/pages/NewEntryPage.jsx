import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../utils/api";
import { EMOTION_CONFIG } from "../utils/emotions";
import { PenLine, Tag, Smile, Loader2, Sparkles } from "lucide-react";

const MOOD_LABELS = ["", "Awful", "Very Bad", "Bad", "Low", "Okay", "Good", "Great", "Very Good", "Excellent", "Perfect"];

export default function NewEntryPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", mood: 5, tags: "" });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.content.length < 10) return toast.error("Write at least 10 characters.");
    setLoading(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await api.post("/journal", { ...form, tags });
      setAnalysis(res.data.entry?.analysis || null);
      toast.success("Entry saved & analyzed ✨");
      setTimeout(() => navigate(`/journal/${res.data.entry._id}`), 1800);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <PenLine size={24} className="text-violet-400" />
          New Journal Entry
        </h1>
        <p className="text-canvas-muted text-sm">Write freely — AI will analyze your emotions after saving.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="Entry title (optional)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-canvas-surface border border-canvas-border rounded-xl px-4 py-3 text-white placeholder-canvas-muted font-display text-lg focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Content */}
        <div className="relative">
          <textarea
            placeholder="What's on your mind today? Write as much as you want — your thoughts, feelings, experiences…"
            value={form.content}
            onChange={(e) => {
              setForm({ ...form, content: e.target.value });
              setCharCount(e.target.value.length);
            }}
            rows={12}
            maxLength={5000}
            className="w-full bg-canvas-surface border border-canvas-border rounded-xl px-5 py-4 text-white placeholder-canvas-muted journal-content text-sm focus:border-violet-500 transition-colors leading-relaxed"
          />
          <span className="absolute bottom-3 right-4 text-xs text-canvas-muted font-mono">
            {charCount}/5000
          </span>
        </div>

        {/* Mood slider */}
        <div className="bg-canvas-surface border border-canvas-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smile size={16} className="text-canvas-muted" />
              <span className="text-sm text-canvas-muted">How are you feeling?</span>
            </div>
            <span className="text-sm font-medium text-white">
              {form.mood}/10 — {MOOD_LABELS[form.mood]}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={form.mood}
            onChange={(e) => setForm({ ...form, mood: parseInt(e.target.value) })}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-canvas-muted mt-1">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Tag size={14} className="text-canvas-muted" />
            <label className="text-xs text-canvas-muted">Tags (comma-separated)</label>
          </div>
          <input
            type="text"
            placeholder="work, anxiety, growth, family…"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full bg-canvas-surface border border-canvas-border rounded-xl px-4 py-3 text-sm text-white placeholder-canvas-muted focus:border-violet-500 transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || form.content.length < 10}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-medium transition-all"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving & analyzing with AI…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Save & Analyze
            </>
          )}
        </button>
      </form>

      {/* Post-analysis preview */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 bg-canvas-surface border border-violet-500/30 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-violet-400" />
              <span className="text-sm font-medium text-violet-300">AI Analysis Complete</span>
            </div>
            {analysis.primaryEmotion && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{EMOTION_CONFIG[analysis.primaryEmotion]?.emoji}</span>
                <span className="text-white font-medium capitalize">{analysis.primaryEmotion}</span>
                <span className="text-canvas-muted text-sm">detected as primary emotion</span>
              </div>
            )}
            {analysis.aiReflection && (
              <p className="text-canvas-muted text-sm leading-relaxed italic">"{analysis.aiReflection}"</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
