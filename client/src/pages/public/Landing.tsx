import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Activity, Radio, Map, ArrowRight, Trophy, Zap, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full flex items-center min-h-[85vh] py-12 md:py-24 lg:py-32">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-slate-50/50 dark:bg-zinc-950/50 -z-10" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply opacity-50 dark:opacity-20 animate-pulse -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-multiply opacity-50 dark:opacity-20 animate-pulse delay-1000 -z-10" />

        <div className="w-full px-4 md:px-12 lg:px-24 mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2 items-center">
            <div className="flex flex-col justify-center space-y-8 z-10 text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-xl border border-border bg-background px-3 py-1 shadow-sm">
                  <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Live Telemetry Now Available
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Command Your Event with Precision
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl lg:text-lg xl:text-xl leading-relaxed mx-auto lg:mx-0">
                  LapSync transforms marathon logistics. Real-time participant tracking, biometric signal monitoring, auto-calculated leaderboards, and immediate emergency telemetry.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row justify-center lg:justify-start">
                <Link to="/public/events">
                  <Button size="lg" className="h-14 px-8 text-base rounded-2xl shadow-xl w-full min-[400px]:w-auto group">
                    Spectate Live Events
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-2xl w-full min-[400px]:w-auto">
                    Create an Account
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Visual Block */}
            <div className="flex items-center justify-center lg:justify-end z-10 p-6 lg:p-0">
              <div className="relative w-full max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-blue-500/30 rounded-3xl blur-2xl transform -rotate-6" />
                <div className="relative rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
                  <div className="p-2 border-b bg-muted/30 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Map className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">Live Map Track</div>
                        <div className="text-sm text-muted-foreground">Monitoring active runners</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-muted/50 rounded-xl p-4 flex items-center justify-between border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center text-xs font-bold font-mono">
                              {i}
                            </div>
                            <div>
                              <div className="h-4 w-24 bg-foreground/10 rounded mb-2" />
                              <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                              <Activity className="w-4 h-4 text-red-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 bg-card border-y">
        <div className="w-full px-4 md:px-12 lg:px-24 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Powerful Tools for Event Command
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-lg">
              Everything you need to orchestrate a massive marathon safely, effectively, and intelligently.
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2 p-6 rounded-3xl border bg-background shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                <Radio className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold">RFID Check-in</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Seamlessly assign and verify participant device connections using rapid RFID checks on race-day.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 p-6 rounded-3xl border bg-background shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold">Bio-Signal Safety</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Instantly track critical participant physiological data and manage distress alerts straight from the command center.
              </p>
            </div>

            <div className="flex flex-col gap-2 p-6 rounded-3xl border bg-background shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold">Dynamic Leaderboards</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Public live-updating race leaderboards calculating estimated finish times based on waypoint checkpoints.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
