import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

interface NavbarProps {
  consultLabel?: string;
}

export default function Navbar({ consultLabel }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isHistory  = location.pathname === "/history";
  const isWelcome  = location.pathname === "/welcome";
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <nav className="sticky top-0 z-50 w-full bg-charcoal">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link
          to="/welcome"
          className="font-display text-lg font-black text-white tracking-tight"
        >
          AP-Analytics
        </Link>

        {user && (
          <div className="flex items-center gap-1">
            {/* Consult / New survey */}
            <Link
              to="/survey"
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isDashboard
                  ? "bg-white text-charcoal"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {consultLabel ?? (isDashboard ? "Consult" : "New Consult")}
            </Link>

            {/* Profile / Welcome */}
            <Link
              to="/welcome"
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isWelcome
                  ? "bg-white text-charcoal"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Profile
            </Link>

            {/* Previous Consults */}
            <Link
              to="/history"
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isHistory
                  ? "bg-white text-charcoal"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Previous Consults
            </Link>

            {/* Divider */}
            <div className="ml-2 h-4 w-px bg-white/20" />

            {/* User name */}
            <span className="ml-2 hidden text-xs text-white/50 sm:block">
              {user.name}
            </span>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ml-1 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
