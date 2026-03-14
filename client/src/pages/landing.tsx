import { motion } from "framer-motion";
import { Shield, Activity, Lock, Search, ArrowRight, Zap, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] bg-primary/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] bg-accent/8 rounded-full blur-[150px]" />
      </div>

      <nav className="w-full py-5 px-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="font-mono font-bold text-lg tracking-tight">
          Quack Quack <span className="text-primary">What ?</span>
        </div>
        <a href="/api/login">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl" data-testid="button-login-nav">
            Sign In
          </Button>
        </a>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium tracking-wider uppercase">
              <Search className="w-4 h-4" />
              <span>AI Skill Inspector</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold font-mono tracking-tight mb-6 leading-[1.1]">
              Don't trust
              <br />
              <span className="text-primary neon-text">the duck.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-md leading-relaxed">
              Just because it looks and sounds like a duck doesn't always mean it's a duck. Deep analysis for AI skills — safety, security, and quality.
            </p>
            <div className="flex items-center gap-4">
              <a href="/api/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-8 h-14 text-base" data-testid="button-get-started">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
            <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Free to use</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> No credit card</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="glass-panel rounded-2xl p-8 border-primary/20 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <span className="opacity-50">&gt;</span>
                  <span>Scanning skill source...</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-400">
                  <span className="opacity-50">&gt;</span>
                  <span>AST analysis complete</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-400">
                  <span className="opacity-50">&gt;</span>
                  <span>Security audit passed</span>
                </div>
                <div className="flex items-center space-x-2 text-amber-400">
                  <span className="opacity-50">&gt;</span>
                  <span>Quality score: 92/100</span>
                </div>
                <div className="flex items-center space-x-2 text-primary">
                  <span className="opacity-50">&gt;</span>
                  <span>Report generated successfully</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Shield className="w-8 h-8 text-emerald-400" />, title: "Safety Analysis", desc: "Detects malicious payloads, sandbox escapes, and dangerous execution patterns in agent skills." },
            { icon: <Activity className="w-8 h-8 text-blue-400" />, title: "Quality Scoring", desc: "Validates completeness, error handling, documentation, and production-grade usability." },
            { icon: <Lock className="w-8 h-8 text-purple-400" />, title: "Security Audit", desc: "Scans for exposed API keys, hardcoded secrets, and dependency vulnerabilities." },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="glass-panel rounded-2xl p-8 border-white/5 hover:border-primary/20 transition-colors"
            >
              <div className="p-3 bg-white/5 rounded-xl ring-1 ring-white/10 w-fit mb-5">
                {feature.icon}
              </div>
              <h3 className="font-mono font-bold text-xl mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
