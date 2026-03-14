import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, ShieldAlert, CheckCircle2, Search, Cpu } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalysisSimProps {
  source: string;
  onComplete: () => void;
}

const LOG_MESSAGES = [
  { text: "Initializing analysis sandbox environment...", icon: Terminal, color: "text-muted-foreground" },
  { text: "Fetching skill source code & dependencies...", icon: Search, color: "text-blue-400" },
  { text: "Parsing abstract syntax tree (AST)...", icon: Cpu, color: "text-purple-400" },
  { text: "Running static code analysis for vulnerabilities...", icon: ShieldAlert, color: "text-amber-400" },
  { text: "Executing heuristic safety checks...", icon: ShieldAlert, color: "text-amber-400" },
  { text: "Scanning for hardcoded secrets and API keys...", icon: Terminal, color: "text-emerald-400" },
  { text: "Evaluating codebase completeness and quality...", icon: CheckCircle2, color: "text-blue-400" },
  { text: "Compiling final evaluation report...", icon: Terminal, color: "text-primary" },
];

export default function AnalysisSim({ source, onComplete }: AnalysisSimProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<{text: string, id: number, color: string}[]>([]);

  useEffect(() => {
    // Progress simulation
    const totalDuration = 6000; // 6 seconds
    const interval = 50;
    const stepDuration = totalDuration / LOG_MESSAGES.length;
    
    let currentProgress = 0;
    let stepIndex = 0;

    const timer = setInterval(() => {
      currentProgress += (interval / totalDuration) * 100;
      
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
        setTimeout(onComplete, 500); // Small delay before transition
        return;
      }

      setProgress(currentProgress);

      const expectedStep = Math.floor((currentProgress / 100) * LOG_MESSAGES.length);
      if (expectedStep > stepIndex && expectedStep < LOG_MESSAGES.length) {
        stepIndex = expectedStep;
        setCurrentStep(stepIndex);
        setLogs(prev => [...prev, { 
          text: LOG_MESSAGES[stepIndex].text, 
          id: Date.now(),
          color: LOG_MESSAGES[stepIndex].color
        }]);
      }
    }, interval);

    // Initial log
    setLogs([{ text: LOG_MESSAGES[0].text, id: Date.now(), color: LOG_MESSAGES[0].color }]);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="glass-panel rounded-2xl p-8 border-primary/30 scan-line shadow-[0_0_50px_rgba(var(--primary),0.1)]">
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="w-20 h-20 bg-black/50 border border-primary/50 rounded-full flex items-center justify-center relative z-10 animate-pulse">
            <Cpu className="w-10 h-10 text-primary" />
          </div>
          {/* Animated rings */}
          <motion.div 
            animate={{ scale: [1, 1.5], opacity: [1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 border border-primary rounded-full"
          />
          <motion.div 
            animate={{ scale: [1, 2], opacity: [1, 0] }}
            transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 border border-primary rounded-full"
          />
        </div>

        <h2 className="text-2xl font-mono font-bold neon-text mb-2">Analyzing Target</h2>
        <p className="text-muted-foreground font-mono text-sm max-w-md text-center truncate px-4 py-1 bg-black/30 rounded border border-white/5">
          {source}
        </p>
      </div>

      <div className="space-y-2 mb-8">
        <div className="flex justify-between font-mono text-sm">
          <span className="text-primary">Evaluation Progress</span>
          <span className="text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-black/50" />
      </div>

      <div className="bg-black/60 rounded-xl p-4 font-mono text-sm h-64 overflow-hidden relative border border-white/5 shadow-inner">
        {/* Terminal Header */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/5 flex items-center px-4 space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
          <span className="ml-2 text-xs text-muted-foreground">eval-engine.exe</span>
        </div>

        <div className="mt-8 flex flex-col justify-end h-full space-y-2 pb-2">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start space-x-3 ${log.color}`}
            >
              <span className="opacity-50 mt-0.5">&gt;</span>
              <span>{log.text}</span>
            </motion.div>
          ))}
          {progress < 100 && (
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-primary mt-1 ml-6"
            />
          )}
        </div>
      </div>
    </div>
  );
}
