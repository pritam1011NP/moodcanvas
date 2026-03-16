export const EMOTION_CONFIG = {
  joy:          { color: "#F59E0B", bg: "#F59E0B22", label: "Joy",          emoji: "✨" },
  trust:        { color: "#10B981", bg: "#10B98122", label: "Trust",         emoji: "🌿" },
  anticipation: { color: "#F97316", bg: "#F9731622", label: "Anticipation",  emoji: "🔥" },
  surprise:     { color: "#8B5CF6", bg: "#8B5CF622", label: "Surprise",      emoji: "⚡" },
  fear:         { color: "#9CA3AF", bg: "#6B728022", label: "Fear",          emoji: "🌫️" },
  sadness:      { color: "#3B82F6", bg: "#3B82F622", label: "Sadness",       emoji: "🌊" },
  disgust:      { color: "#84CC16", bg: "#84CC1622", label: "Disgust",       emoji: "🍃" },
  anger:        { color: "#EF4444", bg: "#EF444422", label: "Anger",         emoji: "🌋" },
  neutral:      { color: "#9CA3AF", bg: "#9CA3AF22", label: "Neutral",       emoji: "🌙" }
};

export const ENERGY_LABELS = {
  very_low: "Very Low",
  low: "Low",
  medium: "Medium",
  high: "High",
  very_high: "Very High"
};

export const getMoodColor = (score) => {
  if (score >= 8) return "#10B981";
  if (score >= 6) return "#F59E0B";
  if (score >= 4) return "#F97316";
  return "#EF4444";
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

export const formatRelative = (dateStr) => {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
};

export const truncate = (str, len = 120) =>
  str && str.length > len ? str.slice(0, len) + "…" : str;
