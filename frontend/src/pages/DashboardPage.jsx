import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { EMOTION_CONFIG, formatRelative, truncate, getMoodColor } from "../utils/emotions";
import { PenLine, BookOpen, TrendingUp, Flame } from "lucide-react";

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-canvas-surface border border-canvas-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "22" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        <p className="text-xs text-canvas-muted">{label}</p>
      </div>
    </div>
  );
}

function EntryCard({ entry }) {
  const emotion = entry.analysis?.primaryEmotion || "neutral";
  const cfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral;

  return (
    <Link to={`/journal/${entry._id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-canvas-surface border border-canvas-border hover:border-canvas-muted rounded-2xl p-5 transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-2 h-full min-h-[40px] rounded-full mr-3 shrink-0"
            style={{ background: entry.canvasColor || cfg.color, opacity: 0.7 }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white mb-1 truncate">
              {entry.title || formatRelative(entry.createdAt)}
            </p>
            <p className="text-xs text-canvas-muted leading-relaxed">
              {truncate(entry.content, 90)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-canvas-border">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border emotion-${emotion}`}
          >
            {cfg.emoji} {cfg.label}
          </span>
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: getMoodColor(entry.mood) }}
            />
            <span className="text-xs text-canvas-muted">{entry.mood}/10</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/journal?limit=6")
      .then((res) => setEntries(res.data.entries || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const avgMood = entries.length
    ? (entries.reduce((s, e) => s + (e.mood || 5), 0) / entries.length).toFixed(1)
    : "—";

  const topEmotion = entries.length
    ? Object.entries(
        entries.reduce((acc, e) => {
          const em = e.analysis?.primaryEmotion || "neutral";
          acc[em] = (acc[em] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-canvas-muted text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          to="/journal/new"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
        >
          <PenLine size={15} />
          New Entry
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total entries" value={user?.totalEntries || 0} icon={BookOpen} color="#A78BFA" />
        <StatCard label="Day streak" value={user?.streak || 0} icon={Flame} color="#F97316" />
        <StatCard label="Avg mood" value={avgMood} icon={TrendingUp} color="#10B981" />
        <StatCard
          label="Top emotion"
          value={topEmotion ? EMOTION_CONFIG[topEmotion]?.emoji + " " + EMOTION_CONFIG[topEmotion]?.label : "—"}
          icon={BookOpen}
          color="#F59E0B"
        />
      </div>

      {/* Recent entries */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-white">Recent entries</h2>
        <Link to="/canvas" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
          View canvas →
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-canvas-surface border border-canvas-border rounded-2xl p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-canvas-border rounded-2xl">
          <div className="w-12 h-12 mood-blob bg-violet-500 opacity-40 mx-auto mb-4" />
          <p className="text-canvas-muted text-sm mb-4">No entries yet. Start writing to build your canvas.</p>
          <Link
            to="/journal/new"
            className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300"
          >
            <PenLine size={14} /> Write your first entry
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {entries.map((entry, i) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <EntryCard entry={entry} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
