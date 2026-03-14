import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const faqs = [
  {
    question: "What is Quack Quack What?",
    answer:
      "Quack Quack What? is an AI skill evaluation tool that analyzes code for safety, quality, and security. You can submit code from GitHub repositories, web URLs, local files, or paste it directly. The tool produces a scored report out of 100 and highlights specific issues so you can understand exactly what needs attention before deploying an AI skill.",
  },
  {
    question: "Do I need to create an account to use the evaluator?",
    answer:
      "No — you can use the evaluator in Guest mode without signing in. Guest mode gives you full access to code analysis and scoring. However, if you want to save your evaluation history, configure an AI provider for chat-based refinement, or access your past reports, you will need to sign in using Google, GitHub, Apple, or email and password.",
  },
  {
    question: "What sources can I evaluate code from?",
    answer:
      "You can evaluate code from four different sources: GitHub repositories (paste a repo URL or owner/repo path), public web URLs pointing to code files, local files uploaded from your device, or code pasted directly into the editor. The tool supports JavaScript, TypeScript, Python, YAML, JSON, and Markdown files.",
  },
  {
    question: "How is the overall score calculated?",
    answer:
      "The overall score is a weighted average of three categories: Safety (40%), Security (30%), and Quality (30%). Safety checks for dangerous patterns like eval() usage, prototype pollution, and sandbox escapes. Security scans for hardcoded API keys, tokens, and exposed secrets. Quality evaluates error handling, type coverage, and code documentation.",
  },
  {
    question: "What does the AI chat feature do?",
    answer:
      "After running an evaluation, you can open the AI chat to describe your specific use case. The AI will assess whether the skill code is fit for your purpose, provide a detailed analysis report covering performance, safety, and security improvements, and generate a refined version of the code optimized for your use case. You need to be signed in and have an AI provider configured to use this feature.",
  },
  {
    question: "Which AI providers are supported?",
    answer:
      "Quack Quack What? supports five AI providers: OpenAI (GPT-4, GPT-4o, etc.), Anthropic (Claude models), Microsoft AI Foundry, Google Cloud Vertex AI, and AWS Bedrock. You can configure your preferred provider and API key in the Settings panel. Your credentials are stored securely and are never exposed in logs or API responses.",
  },
  {
    question: "Is my code stored or shared with anyone?",
    answer:
      "Your code is stored in the application database solely for the purpose of generating evaluation reports and enabling chat-based refinement. It is associated with your user account if you are signed in, or stored anonymously in Guest mode. Code is never shared with third parties. When using the AI chat feature, your code is sent to your configured AI provider for analysis.",
  },
  {
    question: "What should I do if I get a low score?",
    answer:
      "A low score indicates areas that need improvement before the code is safe to deploy. Review the detailed findings in each category — Safety, Security, and Quality — to see the specific issues detected. Common fixes include removing hardcoded secrets, replacing eval() with safer alternatives, adding proper error handling, and improving input validation. You can also use the AI chat to get tailored recommendations.",
  },
  {
    question: "Can I evaluate entire GitHub repositories?",
    answer:
      "Yes. When you provide a GitHub repository URL (e.g., owner/repo), the tool fetches up to 20 code files from the repository and analyzes them together. It looks at TypeScript, JavaScript, Python, Markdown, JSON, and YAML files. If you want to evaluate a specific file, you can include the file path (e.g., owner/repo/src/index.ts) to focus the analysis on that single file.",
  },
  {
    question: "Where can I find my previous evaluations?",
    answer:
      "All your past evaluations are available on the History page, accessible from the navigation bar at the top of the screen. The History page shows each evaluation with its source, score, and timestamp. You need to be signed in to access your history — evaluations run in Guest mode are not linked to any account and cannot be retrieved later.",
  },
];

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="border border-white/10 rounded-xl overflow-hidden glass-panel"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors cursor-pointer"
        data-testid={`button-faq-toggle-${index}`}
      >
        <span className="font-mono text-sm md:text-base text-foreground pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-primary shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="px-5 pb-5"
        >
          <p className="text-muted-foreground leading-relaxed text-sm" data-testid={`text-faq-answer-${index}`}>
            {answer}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Faq() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Evaluator
            </Button>
          </Link>
        </div>

        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-5xl font-bold font-mono tracking-tight mb-4 flex items-center">
            <HelpCircle className="w-7 h-7 md:w-10 md:h-10 mr-3 md:mr-4 text-primary shrink-0" />
            <span>FAQ <span className="text-primary neon-text hidden sm:inline">— Questions</span></span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground">
            Everything you need to know to get started.
          </p>
        </header>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm mb-4">Still have questions?</p>
          <Link href="/readme">
            <Button variant="outline" className="border-white/10 hover:bg-white/5 font-mono" data-testid="link-faq-to-docs">
              View Full Documentation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
