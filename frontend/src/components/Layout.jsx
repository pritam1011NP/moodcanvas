import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, BookOpen, Sparkles, Palette,
  LogOut, PenLine, Flame
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/journal/new", icon: PenLine, label: "New Entry" },
  { to: "/canvas", icon: Palette, label: "Mood Canvas" },
  { to: "/insights", icon: Sparkles, label: "AI Insights" }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="flex min-h-screen bg-canvas-bg">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-canvas-border bg-canvas-surface">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-canvas-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 mood-blob bg-violet-500" style={{ animationDuration: "6s" }} />
            <span className="font-display text-lg font-semibold text-white tracking-tight">
              MoodCanvas
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-canvas-muted hover:text-white hover:bg-canvas-card"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-canvas-border">
          {/* Streak */}
          {user?.streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Flame size={15} className="text-orange-400" />
              <span className="text-xs text-orange-300 font-medium">
                {user.streak} day streak
              </span>
            </div>
          )}
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-canvas-muted truncate">{user?.totalEntries || 0} entries</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-canvas-muted hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
