import { Shield, ShieldAlert, Activity, Lock, RefreshCw, Download, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SkillChat from "./SkillChat";
import type { Evaluation } from "@shared/schema";

interface EvaluationReportProps {
  evaluation: Evaluation;
  onReset: () => void;
}

export default function EvaluationReport({ evaluation, onReset }: EvaluationReportProps) {
  const scores = {
    overall: evaluation.overallScore,
    safety: evaluation.safetyScore,
    quality: evaluation.qualityScore,
    security: evaluation.securityScore
  };

  const isPassing = scores.overall >= 80;

  const safetyFindings = (evaluation.safetyFindings || []) as string[];
  const qualityFindings = (evaluation.qualityFindings || []) as string[];
  const securityFindings = (evaluation.securityFindings || []) as string[];

  const handleDownload = () => {
    const report = `
QUACK QUACK WHAT? - EVALUATION REPORT
======================================
Source: ${evaluation.source}
Date: ${evaluation.createdAt ? new Date(evaluation.createdAt).toISOString() : new Date().toISOString()}

SCORES
------
Overall: ${scores.overall}/100
Safety:  ${scores.safety}/100
Quality: ${scores.quality}/100
Security: ${scores.security}/100

SUMMARY
-------
${evaluation.summary}

SAFETY FINDINGS
---------------
${safetyFindings.join("\n")}

QUALITY FINDINGS
----------------
${qualityFindings.join("\n")}

SECURITY FINDINGS
-----------------
${securityFindings.join("\n")}

(c) Taashi Manyanga 2026
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation-${evaluation.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="glass-panel rounded-2xl p-4 md:p-6 border-l-4 border-l-primary shadow-xl">
        <div className="flex flex-col gap-4 md:gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
              <h2 className="text-xl md:text-2xl font-mono font-bold" data-testid="text-report-title">Evaluation Report</h2>
              <span
                data-testid="text-report-status"
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider ${isPassing ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'}`}
              >
                {isPassing ? 'PASSED' : 'REVIEW REQUIRED'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground font-mono text-xs md:text-sm">
              <FileText className="w-4 h-4 shrink-0" />
              <span className="truncate" title={evaluation.source} data-testid="text-report-source">{evaluation.source}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-6 bg-black/40 p-3 md:p-4 rounded-xl border border-white/5">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-mono font-bold text-primary neon-text" data-testid="text-overall-score">{scores.overall}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Score</div>
            </div>
            <div className="h-12 w-px bg-white/10 hidden sm:block" />
            <div className="space-y-2 flex-1 min-w-[120px]">
              <ScoreBar label="Safety" value={scores.safety} color="bg-emerald-500" />
              <ScoreBar label="Quality" value={scores.quality} color="bg-blue-500" />
              <ScoreBar label="Security" value={scores.security} color="bg-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="glass-panel rounded-xl p-4 md:p-6 border-white/5">
            <h3 className="text-base md:text-lg font-mono font-bold mb-3 md:mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Executive Summary
            </h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed" data-testid="text-summary">
              {evaluation.summary}
            </p>
          </div>

          <div className="glass-panel rounded-xl p-4 md:p-6 border-white/5">
            <h3 className="text-base md:text-lg font-mono font-bold mb-3 md:mb-4">Detailed Analysis</h3>
            <Accordion type="multiple" defaultValue={["safety", "security", "quality"]} className="w-full">
              
              <AccordionItem value="safety" className="border-white/10">
                <AccordionTrigger className="hover:no-underline hover:bg-white/5 px-2 md:px-4 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-emerald-400 shrink-0" />
                    <span className="font-mono text-sm md:text-base">Safety & Integrity ({scores.safety}/100)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 md:px-4 pt-3 md:pt-4 pb-4 md:pb-6 text-muted-foreground">
                  <ul className="space-y-2 md:space-y-3">
                    {safetyFindings.map((f, i) => (
                      <FindingItem key={i} text={f} />
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security" className="border-white/10">
                <AccordionTrigger className="hover:no-underline hover:bg-white/5 px-2 md:px-4 rounded-lg transition-colors mt-2">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-purple-400 shrink-0" />
                    <span className="font-mono text-sm md:text-base">Security Compliance ({scores.security}/100)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 md:px-4 pt-3 md:pt-4 pb-4 md:pb-6 text-muted-foreground">
                  <ul className="space-y-2 md:space-y-3">
                    {securityFindings.map((f, i) => (
                      <FindingItem key={i} text={f} />
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="quality" className="border-white/10">
                <AccordionTrigger className="hover:no-underline hover:bg-white/5 px-2 md:px-4 rounded-lg transition-colors mt-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-blue-400 shrink-0" />
                    <span className="font-mono text-sm md:text-base">Quality & Usability ({scores.quality}/100)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 md:px-4 pt-3 md:pt-4 pb-4 md:pb-6 text-muted-foreground">
                  <ul className="space-y-2 md:space-y-3">
                    {qualityFindings.map((f, i) => (
                      <FindingItem key={i} text={f} />
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>

          <SkillChat evaluation={evaluation} />
          
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-4 md:p-6 border-white/5 flex flex-col space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">Actions</h3>
            
            <Button
              onClick={handleDownload}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold justify-start"
              data-testid="button-download-report"
            >
              <Download className="w-4 h-4 mr-3" />
              Download Full Report
            </Button>
            
            <div className="h-px bg-white/10 my-2" />
            
            <Button 
              variant="ghost" 
              onClick={onReset}
              className="w-full text-muted-foreground hover:text-foreground justify-start"
              data-testid="button-reset"
            >
              <RefreshCw className="w-4 h-4 mr-3" />
              Evaluate Another Skill
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex items-center justify-between text-xs font-mono gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center flex-1 max-w-[120px]">
        <Progress value={value} className="h-1.5 bg-white/10" indicatorClassName={color} />
      </div>
      <span className="text-muted-foreground w-6 text-right">{value}</span>
    </div>
  );
}

function FindingItem({ text }: { text: string }) {
  const isPass = text.startsWith("[PASS]");
  const isCritical = text.startsWith("[CRITICAL]");

  if (isPass) {
    return (
      <li className="flex items-start">
        <CheckCircle className="w-4 h-4 mr-2 text-emerald-500 mt-0.5 shrink-0" />
        <span className="text-xs md:text-sm">{text.replace("[PASS] ", "")}</span>
      </li>
    );
  }

  return (
    <li className="flex items-start">
      <AlertTriangle className={`w-4 h-4 mr-2 mt-0.5 shrink-0 ${isCritical ? 'text-red-500' : 'text-amber-500'}`} />
      <span className="text-xs md:text-sm">{text.replace(/^\[(CRITICAL|WARN|INFO)\]\s*/, "")}</span>
    </li>
  );
}
