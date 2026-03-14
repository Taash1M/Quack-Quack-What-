import { useState } from "react";
import { Github, Globe, HardDrive, ArrowRight, Code2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SkillImporterProps {
  onStart: (source: string, sourceType: string, code?: string) => void;
}

export default function SkillImporter({ onStart }: SkillImporterProps) {
  const [inputValue, setInputValue] = useState("");
  const [pasteValue, setPasteValue] = useState("");
  const [activeTab, setActiveTab] = useState("github");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "paste") {
      if (!pasteValue.trim()) return;
      onStart("direct-paste", "local", pasteValue);
    } else {
      if (!inputValue.trim()) return;
      onStart(inputValue, activeTab);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 md:p-8 relative overflow-hidden border-primary/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="flex items-center space-x-3 mb-5 md:mb-6">
        <div className="p-2 bg-primary/10 rounded-lg text-primary ring-1 ring-primary/20">
          <Code2 className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-mono font-bold">Import Skill Target</h2>
          <p className="text-xs md:text-sm text-muted-foreground">Select source to begin deep evaluation</p>
        </div>
      </div>

      <Tabs defaultValue="github" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/10 p-1 rounded-xl mb-4 md:mb-6 h-auto">
          <TabsTrigger value="github" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg font-mono text-xs py-2 px-1 data-[state=active]:shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <Github className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">GitHub</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg font-mono text-xs py-2 px-1 data-[state=active]:shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <Globe className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">URL</span>
          </TabsTrigger>
          <TabsTrigger value="local" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg font-mono text-xs py-2 px-1 data-[state=active]:shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <HardDrive className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Local</span>
          </TabsTrigger>
          <TabsTrigger value="paste" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg font-mono text-xs py-2 px-1 data-[state=active]:shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <Upload className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Paste</span>
          </TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <TabsContent value="github" className="mt-0 outline-none">
            <div className="space-y-3">
              <Input 
                type="text"
                placeholder="e.g. username/skill-repo or GitHub URL"
                className="w-full bg-black/50 border-white/10 font-mono focus-visible:ring-primary h-12 md:h-14 pl-4 text-sm md:text-lg rounded-xl"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                data-testid="input-github-repo"
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg px-6 h-11"
                data-testid="button-submit-github"
              >
                Analyze
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="mt-0 outline-none">
            <div className="space-y-3">
              <Input 
                type="url"
                placeholder="https://example.com/skill.json"
                className="w-full bg-black/50 border-white/10 font-mono focus-visible:ring-primary h-12 md:h-14 pl-4 text-sm md:text-lg rounded-xl"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                data-testid="input-url-path"
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg px-6 h-11"
                data-testid="button-submit-url"
              >
                Analyze
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="local" className="mt-0 outline-none">
            <div className="space-y-3">
              <Input 
                type="text"
                placeholder="/path/to/local/skill/directory"
                className="w-full bg-black/50 border-white/10 font-mono focus-visible:ring-primary h-12 md:h-14 pl-4 text-sm md:text-lg rounded-xl"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                data-testid="input-local-path"
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg px-6 h-11"
                data-testid="button-submit-local"
              >
                Analyze
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="mt-0 outline-none space-y-4">
            <textarea
              placeholder="Paste your skill code here..."
              className="w-full bg-black/50 border border-white/10 font-mono focus-visible:ring-primary text-sm rounded-xl p-4 min-h-[160px] md:min-h-[200px] resize-y text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={pasteValue}
              onChange={(e) => setPasteValue(e.target.value)}
              data-testid="input-paste-code"
            />
            <Button 
              type="submit" 
              disabled={!pasteValue.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg h-12"
              data-testid="button-submit-paste"
            >
              Analyze Code
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}
