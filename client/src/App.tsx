import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Readme from "@/pages/readme";
import History from "@/pages/history";
import Landing from "@/pages/landing";
import Faq from "@/pages/faq";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-mono animate-pulse text-lg">Initializing...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/readme" component={Readme} />
      <Route path="/faq" component={Faq} />
      <Route path="/history" component={user ? History : Landing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <div className="fixed bottom-4 right-4 text-xs font-mono text-muted-foreground/60 pointer-events-none z-50">
          &copy; Taashi Manyanga 2026
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
