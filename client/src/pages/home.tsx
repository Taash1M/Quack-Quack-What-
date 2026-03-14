import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import SkillImporter from "@/components/evaluator/SkillImporter";
import AnalysisSim from "@/components/evaluator/AnalysisSim";
import EvaluationReport from "@/components/evaluator/EvaluationReport";
import SettingsModal from "@/components/evaluator/SettingsModal";
import { Shield, Activity, Lock, Search, BookOpen, Clock, LogOut, LogIn, User as UserIcon, HelpCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Evaluation } from "@shared/schema";

export type AppState = "idle" | "fetching" | "scanning" | "results";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [appState, setAppState] = useState<AppState>("idle");
  const [skillSource, setSkillSource] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStartScan = async (source: string, sourceType: string, code?: string) => {
    setSkillSource(source);
    setError(null);
    setAppState("fetching");

    try {
      let skillCode = code;

      if (!skillCode) {
        const fetchRes = await apiRequest("POST", "/api/fetch-skill", { source, sourceType });
        const fetchData = await fetchRes.json();
        skillCode = fetchData.code;
      }

      setAppState("scanning");

      const evalRes = await apiRequest("POST", "/api/evaluate", {
        source,
        sourceType,
        code: skillCode,
      });
      const evalData = await evalRes.json();
      setEvaluation(evalData);
    } catch (err: any) {
      setError(err.message);
      setAppState("idle");
    }
  };

  const handleScanComplete = () => {
    setAppState("results");
  };

  const handleReset = () => {
    setAppState("idle");
    setSkillSource("");
    setEvaluation(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-16 md:py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="absolute top-3 right-3 md:top-6 md:right-6 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-3 absolute md:relative right-0 top-10 md:top-0 bg-card/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border border-white/10 md:border-0 rounded-xl md:rounded-none p-3 md:p-0 min-w-[200px] md:min-w-0 shadow-xl md:shadow-none`}>
          <Link href="/faq" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full md:w-auto justify-start text-muted-foreground hover:text-foreground" data-testid="link-faq">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </Button>
          </Link>
          <Link href="/readme" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full md:w-auto justify-start text-muted-foreground hover:text-foreground">
              <BookOpen className="w-4 h-4 mr-2" />
              Docs
            </Button>
          </Link>
          {user && (
            <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full md:w-auto justify-start text-muted-foreground hover:text-foreground">
                <Clock className="w-4 h-4 mr-2" />
                History
              </Button>
            </Link>
          )}
          <div className="md:contents" onClick={() => setMobileMenuOpen(false)}>
            <SettingsModal />
          </div>
          <div className="h-px md:h-auto md:w-px bg-white/10 my-1 md:my-0 md:mx-0" />
          {user ? (
            <div className="flex items-center gap-3 px-2 md:px-0 md:pl-3 md:border-l md:border-white/10">
              {user.profileImageUrl && (
                <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full ring-2 ring-primary/30" />
              )}
              <span className="text-sm font-mono text-muted-foreground flex-1 truncate">
                {user.firstName || user.email}
              </span>
              <a href="/api/logout">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground px-2" data-testid="button-logout">
                  <LogOut className="w-4 h-4" />
                </Button>
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 md:px-0 md:pl-3 md:border-l md:border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/10 ring-2 ring-white/10 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-mono text-muted-foreground">Guest</span>
              <a href="/api/login">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 px-2" data-testid="button-sign-in">
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <header className="w-full max-w-5xl mb-8 md:mb-12 text-center mt-4 md:mt-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center space-x-3 mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs md:text-sm font-medium tracking-wider uppercase"
        >
          <Search className="w-4 h-4" />
          <span>Skill Inspector Protocol</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-6xl font-bold font-mono tracking-tight mb-4"
        >
          Quack Quack <span className="text-primary neon-text">What ?</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-lg px-2"
        >
          Just because it looks and sounds like a duck doesn't always mean it's a duck
        </motion.p>
      </header>

      {!user && appState === "idle" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mb-6 bg-primary/5 border border-primary/20 rounded-xl px-4 md:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
        >
          <span className="text-sm text-muted-foreground">
            You're using <strong className="text-foreground">Guest mode</strong>. Sign in to save your evaluation history.
          </span>
          <a href="/api/login">
            <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 text-xs shrink-0" data-testid="button-guest-sign-in">
              <LogIn className="w-3 h-3 mr-1.5" />
              Sign In
            </Button>
          </a>
        </motion.div>
      )}

      <main className="w-full max-w-5xl flex-1 relative flex justify-center">
        <AnimatePresence mode="wait">
          {(appState === "idle" || appState === "fetching") && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              className="w-full max-w-2xl"
            >
              <SkillImporter onStart={handleStartScan} />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-destructive/20 border border-destructive/50 text-destructive-foreground rounded-xl p-4 font-mono text-sm"
                  data-testid="text-error"
                >
                  {error}
                </motion.div>
              )}

              {appState === "fetching" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-center text-primary font-mono text-sm animate-pulse"
                >
                  Fetching skill source code...
                </motion.div>
              )}
              
              <div className="mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <FeatureCard 
                  icon={<Shield className="w-6 h-6 text-emerald-400" />}
                  title="Safety Analysis"
                  desc="Detects malicious payloads and dangerous execution patterns."
                />
                <FeatureCard 
                  icon={<Activity className="w-6 h-6 text-blue-400" />}
                  title="Quality Checks"
                  desc="Validates comprehensive design and production-grade usability."
                />
                <FeatureCard 
                  icon={<Lock className="w-6 h-6 text-purple-400" />}
                  title="Security Audit"
                  desc="Scans for exposed API keys and compliance vulnerabilities."
                />
              </div>
            </motion.div>
          )}

          {appState === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl"
            >
              <AnalysisSim source={skillSource} onComplete={handleScanComplete} />
            </motion.div>
          )}

          {appState === "results" && evaluation && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <EvaluationReport evaluation={evaluation} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-panel p-5 md:p-6 rounded-xl flex flex-col items-center text-center space-y-3 hover:bg-card/80 transition-colors border-white/5">
      <div className="p-3 bg-white/5 rounded-full ring-1 ring-white/10 shadow-inner">
        {icon}
      </div>
      <h3 className="font-mono font-semibold text-base md:text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
