import { useState, useEffect } from "react";
import { Settings, Check, Key, Server, Cloud, Cpu, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState("openai");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [targetUri, setTargetUri] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [projectId, setProjectId] = useState("");
  const [location, setLocation] = useState("us-central1");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");

  const { data: existingConfig } = useQuery({
    queryKey: ["/api/provider-config"],
    enabled: isOpen && !!user,
    retry: false,
  });

  useEffect(() => {
    if (existingConfig && existingConfig.provider) {
      setActiveProvider(existingConfig.provider);
      setModel(existingConfig.model || "");
    }
  }, [existingConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const body: Record<string, string | null> = {
        provider: activeProvider,
        apiKey: apiKey || null,
        model: model || null,
        targetUri: targetUri || null,
        region: region || null,
        projectId: projectId || null,
        location: location || null,
        accessKeyId: accessKeyId || null,
        secretAccessKey: secretAccessKey || null,
      };

      await apiRequest("POST", "/api/provider-config", body);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setIsOpen(false);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to save config:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" data-testid="button-settings">
          <Settings className="w-4 h-4 mr-2" />
          AI Provider
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-primary/30 shadow-[0_0_50px_rgba(var(--primary),0.1)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-mono font-bold flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-primary" />
            Evaluation Engine Configuration
          </DialogTitle>
          <DialogDescription>
            Configure the AI provider used for skill analysis, chat interactions, and code refinement.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {!user ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Sign in to configure your AI provider.</p>
              <a href="/api/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">Sign In</Button>
              </a>
            </div>
          ) : (
          <Tabs value={activeProvider} onValueChange={setActiveProvider} className="w-full">
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 bg-black/40 border border-white/10 p-1 rounded-xl mb-4 md:mb-6 h-auto gap-1">
              <TabsTrigger value="openai" className="flex flex-col py-2 px-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg font-mono text-[10px] md:text-xs">
                <Box className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5" />
                OpenAI
              </TabsTrigger>
              <TabsTrigger value="anthropic" className="flex flex-col py-2 px-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg font-mono text-[10px] md:text-xs">
                <Cloud className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5" />
                Anthropic
              </TabsTrigger>
              <TabsTrigger value="foundry" className="flex flex-col py-2 px-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg font-mono text-[10px] md:text-xs">
                <Server className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5" />
                Foundry
              </TabsTrigger>
              <TabsTrigger value="vertex" className="flex flex-col py-2 px-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg font-mono text-[10px] md:text-xs">
                <Cloud className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5" />
                Vertex
              </TabsTrigger>
              <TabsTrigger value="bedrock" className="flex flex-col py-2 px-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg font-mono text-[10px] md:text-xs">
                <Server className="w-3.5 h-3.5 md:w-4 md:h-4 mb-0.5" />
                Bedrock
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSave}>
              <div className="space-y-4 min-h-[200px]">
                
                <TabsContent value="openai" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key" className="text-muted-foreground font-mono">API Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input id="openai-key" type="password" placeholder="sk-..." value={apiKey} onChange={e => setApiKey(e.target.value)} className="pl-9 bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-openai-key" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openai-model" className="text-muted-foreground font-mono">Model ID</Label>
                    <Input id="openai-model" value={model || "gpt-4-turbo-preview"} onChange={e => setModel(e.target.value)} className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-openai-model" />
                  </div>
                </TabsContent>

                <TabsContent value="anthropic" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="anthropic-key" className="text-muted-foreground font-mono">API Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input id="anthropic-key" type="password" placeholder="sk-ant-..." value={apiKey} onChange={e => setApiKey(e.target.value)} className="pl-9 bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-anthropic-key" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anthropic-model" className="text-muted-foreground font-mono">Model ID</Label>
                    <Input id="anthropic-model" value={model || "claude-3-opus-20240229"} onChange={e => setModel(e.target.value)} className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-anthropic-model" />
                  </div>
                </TabsContent>

                <TabsContent value="foundry" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="foundry-uri" className="text-muted-foreground font-mono">Target URI / Endpoint</Label>
                    <Input id="foundry-uri" placeholder="https://..." value={targetUri} onChange={e => setTargetUri(e.target.value)} className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-foundry-uri" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foundry-key" className="text-muted-foreground font-mono">API Key (Optional)</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input id="foundry-key" type="password" placeholder="Key if required" value={apiKey} onChange={e => setApiKey(e.target.value)} className="pl-9 bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-foundry-key" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vertex" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vertex-project" className="text-muted-foreground font-mono">Google Cloud Project ID</Label>
                    <Input id="vertex-project" placeholder="my-gcp-project" value={projectId} onChange={e => setProjectId(e.target.value)} className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-vertex-project" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vertex-location" className="text-muted-foreground font-mono">Location</Label>
                    <Input id="vertex-location" value={location} onChange={e => setLocation(e.target.value)} className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-vertex-location" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vertex-key" className="text-muted-foreground font-mono">Service Account Key (JSON)</Label>
                    <Input id="vertex-key" type="password" placeholder="{...}" value={apiKey} onChange={e => setApiKey(e.target.value)} className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-vertex-key" />
                  </div>
                </TabsContent>

                <TabsContent value="bedrock" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrock-region" className="text-muted-foreground font-mono">AWS Region</Label>
                    <Input id="bedrock-region" value={region} onChange={e => setRegion(e.target.value)} className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-bedrock-region" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrock-access" className="text-muted-foreground font-mono">Access Key ID</Label>
                    <Input id="bedrock-access" placeholder="AKIA..." value={accessKeyId} onChange={e => setAccessKeyId(e.target.value)} className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-bedrock-access" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrock-secret" className="text-muted-foreground font-mono">Secret Access Key</Label>
                    <Input id="bedrock-secret" type="password" placeholder="..." value={secretAccessKey} onChange={e => setSecretAccessKey(e.target.value)} className="bg-black/50 border-white/10 focus-visible:ring-primary font-mono" data-testid="input-bedrock-secret" />
                  </div>
                </TabsContent>

              </div>

              <div className="mt-8 flex justify-end">
                <Button 
                  type="submit"
                  disabled={isSaving}
                  className={`w-full sm:w-auto font-mono transition-all ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                  data-testid="button-save-config"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Config Saved
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
