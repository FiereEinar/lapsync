import { Outlet, Link } from "react-router-dom";
import { Activity } from "lucide-react";
import { Button } from "./ui/button";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full flex-1">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 mr-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight">LapSync</span>
            </Link>
            
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/public/events" className="text-muted-foreground hover:text-foreground transition-colors">
                Live Events
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="rounded-xl">Log In</Button>
            </Link>
            <Link to="/dashboard">
              <Button className="rounded-xl shadow-md">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full bg-slate-50/50 dark:bg-zinc-950/50">
        <Outlet />
      </main>

      <footer className="border-t py-6 md:py-0 w-full mt-auto bg-card">
        <div className="w-full px-4 md:px-8 flex flex-col md:flex-row items-center justify-between h-16">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LapSync. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/public/events" className="text-sm text-muted-foreground hover:underline">Events</Link>
            <Link to="/login" className="text-sm text-muted-foreground hover:underline">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
