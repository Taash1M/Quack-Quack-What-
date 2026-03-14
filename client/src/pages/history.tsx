import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Clock, Shield, Activity, Lock, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import type { Evaluation } from "@shared/schema";

export default function History() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: evaluations, isLoading } = useQuery<Evaluation[]>({
    queryKey: ["/api/history"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-mono animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your history.</p>
          <a href="/api/login"><Button>Sign In</Button></a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Evaluator
            </Button>
          </Link>
        </div>

        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-bold font-mono tracking-tight mb-2 flex items-center">
            <Clock className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 text-primary shrink-0" />
            Evaluation <span className="text-primary neon-text ml-2">History</span>
          </h1>
          <p className="text-muted-foreground">Your past skill evaluations and analysis results.</p>
        </header>

        {isLoading ? (
          <div className="text-center py-20 text-primary font-mono animate-pulse">Loading history...</div>
        ) : !evaluations || evaluations.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border-white/5">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-mono font-bold text-xl mb-2">No evaluations yet</h3>
            <p className="text-muted-foreground mb-6">Start by analyzing a skill on the main dashboard.</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                Go to Evaluator
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation, index) => (
              <motion.div
                key={evaluation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-panel rounded-xl p-4 md:p-6 border-white/5 hover:border-primary/20 transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-mono font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-none" data-testid={`text-history-source-${evaluation.id}`}>
                        {evaluation.source}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono ${evaluation.overallScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {evaluation.overallScore >= 80 ? 'PASSED' : 'REVIEW'}
                      </span>
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground flex flex-wrap items-center gap-2 md:gap-4">
                      <span>{evaluation.sourceType}</span>
                      <span>{new Date(evaluation.createdAt).toLocaleDateString()} {new Date(evaluation.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 pt-2 md:pt-0 border-t md:border-0 border-white/5">
                    <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-mono">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" />
                        <span>{evaluation.safetyScore}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" />
                        <span>{evaluation.qualityScore}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400" />
                        <span>{evaluation.securityScore}</span>
                      </div>
                    </div>
                    <div className="text-xl md:text-2xl font-mono font-bold text-primary" data-testid={`text-history-score-${evaluation.id}`}>
                      {evaluation.overallScore}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
