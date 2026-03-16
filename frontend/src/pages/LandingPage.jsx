import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Brain, BarChart3, Palette } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Emotion Analysis",
    desc: "Claude AI reads between the lines — detecting emotions, themes, and patterns you might not see yourself."
  },
  {
    icon: Palette,
    title: "Visual Mood Canvas",
    desc: "Watch your emotional journey come alive as an evolving visual canvas of colors and shapes over time."
  },
  {
    icon: BarChart3,
    title: "Weekly Insight Reports",
    desc: "Get personalized AI coaching every week based on your emotional patterns and recurring themes."
  }
];

const BLOBS = [
  { color: "#A78BFA", size: 300, x: "10%", y: "20%", delay: 0 },
  { color: "#F59E0B", size: 200, x: "70%", y: "10%", delay: 2 },
  { color: "#3B82F6", size: 250, x: "80%", y: "65%", delay: 4 },
  { color: "#10B981", size: 180, x: "5%", y: "75%", delay: 1 }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas-bg overflow-hidden relative">
      {/* Ambient blobs */}
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10 blur-3xl mood-blob pointer-events-none"
          style={{
            width: blob.size,
            height: blob.size,
            background: blob.color,
            left: blob.x,
            top: blob.y,
            animationDelay: `${blob.delay}s`
          }}
        />
      ))}

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-canvas-border/50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 mood-blob bg-violet-500" />
          <span className="font-display text-lg font-semibold text-white">MoodCanvas</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-canvas-muted hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl transition-colors font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Smile Please 
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-bold text-white leading-tight mb-6">
            Your emotions,
            <br />
            <em className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
              beautifully mapped
            </em>
          </h1>

          <p className="text-canvas-muted text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            MoodCanvas is an AI-powered journal that analyzes your feelings, identifies patterns,
            and turns your inner world into a living visual canvas — week by week.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-violet-500/20"
            >
              Start journaling free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-canvas-border hover:border-canvas-muted text-canvas-muted hover:text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        {/* Mock canvas preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 relative"
        >
          <div className="rounded-2xl border border-canvas-border bg-canvas-surface p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-canvas-muted font-mono">mood-canvas — dashboard</span>
            </div>
            {/* Simulated mood grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const colors = ["#A78BFA", "#F59E0B", "#3B82F6", "#10B981", "#EF4444", "#F97316", "#070b5f"];
                const intensities = [0.3, 0.5, 0.7, 0.9, 0.4, 0.6, 0.8, 0.2];
                const color = colors[i % colors.length];
                const opacity = intensities[i % intensities.length];
                return (
                  <div
                    key={i}
                    className="h-8 rounded-lg transition-transform hover:scale-110"
                    style={{ background: color, opacity: i > 28 ? 0.1 : opacity }}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="p-6 rounded-2xl border border-canvas-border bg-canvas-surface hover:border-violet-500/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-violet-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-canvas-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
