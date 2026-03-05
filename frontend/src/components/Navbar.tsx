import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BarChart3, LogOut, History, PlusCircle } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/welcome" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span>AP Analytics</span>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user.name}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/history">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/survey">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">New Survey</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
