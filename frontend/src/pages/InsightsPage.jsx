import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import api from "../utils/api";
import { EMOTION_CONFIG, getMoodColor, formatDate } from "../utils/emotions";
import { Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

const TREND_ICON = {
  improving: <TrendingUp size={15} className="text-emerald-400" />,
  declining: <TrendingDown size={15} className="text-red-400" />,
  stable: <Minus size={15} className="text-canvas-muted" />,
  mixed: <Sparkles size={15} className="text-yellow-400" />
};

export default function InsightsPage() {
  const [report, setReport] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/journal/stats/timeline?days=14"),
      api.get("/insights/themes"),
      api.get("/insights/weekly")
    ])
      .then(([tl, th, rp]) => {
        setTimeline(tl.data.timeline || []);
        setThemes(th.data.themes || []);
        if (rp.data.report) setReport(rp.data.report);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refreshReport = async () => {
    setLoadingReport(true);
    try {
      const res = await api.get("/insights/weekly");
      if (res.data.report) setReport(res.data.report);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  // Prepare chart data
  const moodChartData = timeline.slice(-10).map((e) => ({
    date: new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    mood: e.mood || 5,
    color: getMoodColor(e.mood || 5)
  }));

  // Aggregate emotions for radar
  const emotionTotals = {};
  timeline.forEach((e) => {
    Object.entries(e.analysis?.emotions || {}).forEach(([em, val]) => {
      emotionTotals[em] = (emotionTotals[em] || 0) + val;
    });
  });
  const radarData = Object.entries(emotionTotals).map(([em, val]) => ({
    emotion: EMOTION_CONFIG[em]?.label || em,
    value: Math.round(val / Math.max(timeline.length, 1))
  }));

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 mood-blob bg-violet-500 opacity-60" />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">AI Insights</h1>
          <p className="text-canvas-muted text-sm">Patterns and reflections from your emotional data</p>
        </div>
        <button
          onClick={refreshReport}
          disabled={loadingReport}
          className="inline-flex items-center gap-2 text-sm text-canvas-muted hover:text-white border border-canvas-border hover:border-canvas-muted px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw size={14} className={loadingReport ? "animate-spin" : ""} />
          Refresh report
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Report */}
        {report ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-canvas-surface border border-violet-500/20 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={16} className="text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Weekly AI Report</span>
              {report.emotionalTrend && (
                <div className="ml-auto flex items-center gap-1.5 text-xs text-canvas-muted">
                  {TREND_ICON[report.emotionalTrend]}
                  <span className="capitalize">{report.emotionalTrend}</span>
                </div>
              )}
            </div>

            <p className="text-white leading-relaxed mb-5">{report.weekSummary}</p>

            <div className="grid md:grid-cols-2 gap-4 mb-5">
              {report.highlights?.length > 0 && (
                <div>
                  <p className="text-xs text-emerald-400 font-medium mb-2 uppercase tracking-wider">Highlights</p>
                  <ul className="space-y-1.5">
                    {report.highlights.map((h, i) => (
                      <li key={i} className="text-sm text-canvas-muted flex gap-2">
                        <span className="text-emerald-400 shrink-0">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.challenges?.length > 0 && (
                <div>
                  <p className="text-xs text-orange-400 font-medium mb-2 uppercase tracking-wider">Challenges</p>
                  <ul className="space-y-1.5">
                    {report.challenges.map((c, i) => (
                      <li key={i} className="text-sm text-canvas-muted flex gap-2">
                        <span className="text-orange-400 shrink-0">△</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {report.coachMessage && (
              <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-4">
                <p className="text-xs text-violet-400 font-medium mb-1 uppercase tracking-wider">Coach message</p>
                <p className="text-sm text-white/80 leading-relaxed">{report.coachMessage}</p>
              </div>
            )}

            {report.affirmation && (
              <div className="p-4 bg-canvas-card border border-canvas-border rounded-xl">
                <p className="text-sm text-canvas-muted italic text-center">"{report.affirmation}"</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="md:col-span-2 p-8 text-center border border-dashed border-canvas-border rounded-2xl">
            <Sparkles size={24} className="text-canvas-muted mx-auto mb-3" />
            <p className="text-canvas-muted text-sm">
              Write journal entries this week to generate your personalized AI report.
            </p>
          </div>
        )}

        {/* Mood timeline chart */}
        {moodChartData.length > 0 && (
          <div className="bg-canvas-surface border border-canvas-border rounded-2xl p-5">
            <p className="text-xs text-canvas-muted font-medium mb-4 uppercase tracking-wider">Mood Timeline</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={moodChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2A45" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B6889" }} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 10, fill: "#6B6889" }} />
                <Tooltip
                  contentStyle={{ background: "#221F35", border: "1px solid #2E2A45", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#E8E6F0" }}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  dot={{ fill: "#A78BFA", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Emotion radar */}
        {radarData.length > 0 && (
          <div className="bg-canvas-surface border border-canvas-border rounded-2xl p-5">
            <p className="text-xs text-canvas-muted font-medium mb-4 uppercase tracking-wider">Emotion Radar</p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2E2A45" />
                <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 9, fill: "#6B6889" }} />
                <Radar
                  dataKey="value"
                  stroke="#A78BFA"
                  fill="#A78BFA"
                  fillOpacity={0.2}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Theme clusters */}
        {themes.length > 0 && (
          <div className="md:col-span-2 bg-canvas-surface border border-canvas-border rounded-2xl p-5">
            <p className="text-xs text-canvas-muted font-medium mb-4 uppercase tracking-wider">Recurring Themes</p>
            <div className="flex flex-wrap gap-2">
              {themes.map(({ theme, count }) => {
                const size = Math.min(count * 2 + 10, 20);
                return (
                  <motion.span
                    key={theme}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1.5 bg-canvas-card border border-canvas-border rounded-xl text-white cursor-default"
                    style={{ fontSize: size }}
                    title={`${count} entries`}
                  >
                    {theme}
                    <span className="text-canvas-muted text-xs ml-1.5">×{count}</span>
                  </motion.span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
