import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { EMOTION_CONFIG, ENERGY_LABELS, formatDate, getMoodColor } from "../utils/emotions";
import toast from "react-hot-toast";
import { ArrowLeft, Trash2, Tag, Zap } from "lucide-react";

function EmotionBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-canvas-muted w-20 shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-1.5 bg-canvas-card rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-mono text-canvas-muted w-8 text-right">{value}</span>
    </div>
  );
}

export default function EntryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/journal/${id}`)
      .then((res) => setEntry(res.data.entry))
      .catch(() => { toast.error("Entry not found."); navigate("/dashboard"); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/journal/${id}`);
      toast.success("Entry deleted.");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to delete.");
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full py-32">
      <div className="w-10 h-10 mood-blob bg-violet-500 opacity-60" />
    </div>
  );

  if (!entry) return null;

  const emotion = entry.analysis?.primaryEmotion || "neutral";
  const cfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral;
  const emotions = entry.analysis?.emotions || {};

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-canvas-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-5">
          {/* Header */}
          <div
            className="rounded-2xl p-6 border"
            style={{
              background: `linear-gradient(135deg, ${entry.canvasColor || cfg.color}15, ${entry.canvasColor || cfg.color}05)`,
              borderColor: `${entry.canvasColor || cfg.color}30`
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-white mb-1">
                  {entry.title || "Untitled Entry"}
                </h1>
                <p className="text-canvas-muted text-sm">{formatDate(entry.createdAt)}</p>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-canvas-muted hover:text-red-400 transition-colors p-2"
                title="Delete entry"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-sm px-3 py-1 rounded-full border emotion-${emotion}`}>
                {cfg.emoji} {cfg.label}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: getMoodColor(entry.mood) }} />
                <span className="text-sm text-canvas-muted">Mood {entry.mood}/10</span>
              </div>
              {entry.analysis?.energyLevel && (
                <div className="flex items-center gap-1.5">
                  <Zap size={13} className="text-canvas-muted" />
                  <span className="text-sm text-canvas-muted">{ENERGY_LABELS[entry.analysis.energyLevel]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Journal content */}
          <div className="bg-canvas-surface border border-canvas-border rounded-2xl p-6">
            <p className="text-white leading-relaxed journal-content whitespace-pre-wrap text-sm">
              {entry.content}
            </p>
          </div>

          {/* Tags */}
          {entry.tags?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={13} className="text-canvas-muted" />
              {entry.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 bg-canvas-card border border-canvas-border rounded-full text-canvas-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Analysis sidebar */}
        {entry.isAnalyzed && (
          <div className="space-y-4">
            {/* AI Reflection */}
            {entry.analysis?.aiReflection && (
              <div className="bg-canvas-surface border border-canvas-border rounded-2xl p-5">
                <p className="text-xs text-violet-400 font-medium mb-2 uppercase tracking-wider">AI Reflection</p>
                <p className="text-sm text-canvas-muted leading-relaxed italic">
                  "{entry.analysis.aiReflection}"
                </p>
              </div>
            )}

            {/* Emotion breakdown */}
            <div className="bg-canvas-surface border border-canvas-border rounded-2xl p-5">
              <p className="text-xs text-canvas-muted font-medium mb-4 uppercase tracking-wider">Emotion Breakdown</p>
              <div className="space-y-2.5">
                {Object.entries(emotions).map(([em, val]) => (
                  <EmotionBar
                    key={em}
                    label={em}
                    value={val}
                    color={EMOTION_CONFIG[em]?.color || "#9CA3AF"}
                  />
                ))}
              </div>
            </div>

            {/* Themes */}
            {entry.analysis?.themes?.length > 0 && (
              <div className="bg-canvas-surface border border-canvas-border rounded-2xl p-5">
                <p className="text-xs text-canvas-muted font-medium mb-3 uppercase tracking-wider">Themes</p>
                <div className="flex flex-wrap gap-2">
                  {entry.analysis.themes.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords */}
            {entry.analysis?.keywords?.length > 0 && (
              <div className="bg-canvas-surface border border-canvas-border rounded-2xl p-5">
                <p className="text-xs text-canvas-muted font-medium mb-3 uppercase tracking-wider">Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.analysis.keywords.map((k) => (
                    <span key={k} className="text-xs px-2 py-0.5 bg-canvas-card border border-canvas-border text-canvas-muted rounded-md font-mono">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sentiment score */}
            {entry.analysis?.sentimentScore !== undefined && (
              <div className="bg-canvas-surface border border-canvas-border rounded-2xl p-5">
                <p className="text-xs text-canvas-muted font-medium mb-3 uppercase tracking-wider">Sentiment Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-canvas-card rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((entry.analysis.sentimentScore + 1) / 2) * 100}%`,
                        background: entry.analysis.sentimentScore >= 0 ? "#10B981" : "#EF4444"
                      }}
                    />
                  </div>
                  <span className="text-sm font-mono text-white">
                    {entry.analysis.sentimentScore > 0 ? "+" : ""}{entry.analysis.sentimentScore.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
