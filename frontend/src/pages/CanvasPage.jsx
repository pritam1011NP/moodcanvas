import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { EMOTION_CONFIG, formatDate } from "../utils/emotions";
import { Tooltip } from "../components/Tooltip";

export default function CanvasPage() {
  const [data, setData] = useState([]);
  const [emotionCounts, setEmotionCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/journal/stats/timeline?days=${range}`)
      .then((res) => {
        setData(res.data.timeline || []);
        setEmotionCounts(res.data.emotionCounts || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  const totalEntries = data.length;
  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const dominantCfg = dominantEmotion ? EMOTION_CONFIG[dominantEmotion] : null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">Mood Canvas</h1>
          <p className="text-canvas-muted text-sm">Your emotional journey, visualized</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === d
                  ? "bg-violet-600 text-white"
                  : "bg-canvas-surface border border-canvas-border text-canvas-muted hover:text-white"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Dominant emotion card */}
      {dominantCfg && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-2xl border flex items-center gap-5"
          style={{
            background: `${dominantCfg.color}10`,
            borderColor: `${dominantCfg.color}30`
          }}
        >
          <div
            className="w-16 h-16 mood-blob shrink-0"
            style={{ background: dominantCfg.color, opacity: 0.8 }}
          />
          <div>
            <p className="text-xs text-canvas-muted mb-1">Dominant emotion — last {range} days</p>
            <p className="font-display text-2xl font-bold text-white">
              {dominantCfg.emoji} {dominantCfg.label}
            </p>
            <p className="text-sm text-canvas-muted">
              Appeared in {emotionCounts[dominantEmotion]} of {totalEntries} entries
            </p>
          </div>
        </motion.div>
      )}

      {/* Canvas grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-canvas-surface animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-canvas-border rounded-2xl">
          <div className="w-12 h-12 mood-blob bg-violet-500 opacity-30 mx-auto mb-4" />
          <p className="text-canvas-muted text-sm mb-3">No entries in this period.</p>
          <Link to="/journal/new" className="text-violet-400 hover:text-violet-300 text-sm">
            Write your first entry →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {data.map((entry, i) => {
              const emotion = entry.analysis?.primaryEmotion || "neutral";
              const cfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral;
              const color = entry.canvasColor || cfg.color;

              return (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ scale: 1.08, zIndex: 10 }}
                  onMouseEnter={() => setHovered(entry)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative"
                >
                  <Link to={`/journal/${entry._id}`}>
                    <div
                      className="h-16 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${color}CC, ${color}66)`,
                        boxShadow: hovered?._id === entry._id ? `0 0 20px ${color}44` : "none"
                      }}
                    >
                      <div className="absolute bottom-1.5 right-1.5 text-base leading-none">
                        {cfg.emoji}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Hovered entry preview */}
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-canvas-surface border border-canvas-border rounded-xl flex items-center gap-4"
            >
              <div
                className="w-3 h-10 rounded-full shrink-0"
                style={{ background: hovered.canvasColor || "#1557c9" }}
              />
              <div>
                <p className="text-xs text-canvas-muted">{formatDate(hovered.createdAt)}</p>
                <p className="text-sm text-white capitalize">
                  {EMOTION_CONFIG[hovered.analysis?.primaryEmotion || "neutral"]?.emoji}{" "}
                  {hovered.analysis?.primaryEmotion || "neutral"} · Mood {hovered.mood}/10
                </p>
              </div>
            </motion.div>
          )}

          {/* Emotion legend */}
          <div className="bg-canvas-surface border border-canvas-border rounded-2xl p-5">
            <p className="text-xs text-canvas-muted font-medium mb-4 uppercase tracking-wider">Emotion frequency</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(emotionCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, count]) => {
                  const cfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral;
                  return (
                    <div
                      key={emotion}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
                      style={{ background: cfg.color + "15", borderColor: cfg.color + "30" }}
                    >
                      <span>{cfg.emoji}</span>
                      <span className="text-xs text-white capitalize">{emotion}</span>
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: cfg.color }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
