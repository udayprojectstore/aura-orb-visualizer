import { useState } from "react";
import { Orb, AgentState } from "@/components/ui/orb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [agentState, setAgentState] = useState<AgentState>(null);
  const [volumeMode, setVolumeMode] = useState<"auto" | "manual">("auto");
  const [manualInput, setManualInput] = useState(0.5);
  const [manualOutput, setManualOutput] = useState(0.5);
  const [colors, setColors] = useState<[string, string]>(["#CADCFC", "#A0B9D1"]);

  const stateButtons: { state: AgentState; label: string }[] = [
    { state: null, label: "Idle" },
    { state: "thinking", label: "Thinking" },
    { state: "listening", label: "Listening" },
    { state: "talking", label: "Talking" },
  ];

  const presetColors: Array<{ name: string; colors: [string, string] }> = [
    { name: "Ocean", colors: ["#CADCFC", "#A0B9D1"] },
    { name: "Sunset", colors: ["#FF6B6B", "#FFA07A"] },
    { name: "Forest", colors: ["#90EE90", "#3CB371"] },
    { name: "Purple Dream", colors: ["#DDA0DD", "#BA55D3"] },
    { name: "Cyber", colors: ["#00FFFF", "#00CED1"] },

    // ← new Ice theme (blue + pink sampled from your image)
    { name: "Ice", colors: ["#A3E4FF", "#F6A9FF"] },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Interactive Orb
          </h1>
          <p className="text-muted-foreground text-lg">
            Experience a dynamic 3D visualization with customizable states and colors
          </p>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Orb Display */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card border-border">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-background/50 relative">
                <Orb
                  colors={colors}
                  agentState={agentState}
                  volumeMode={volumeMode}
                  manualInput={manualInput}
                  manualOutput={manualOutput}
                  className="w-full h-full"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="text-sm">
                    {agentState === null ? "Idle" : agentState.charAt(0).toUpperCase() + agentState.slice(1)}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Agent State */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Agent State</h3>
              <div className="grid grid-cols-2 gap-2">
                {stateButtons.map(({ state, label }) => (
                  <Button
                    key={label}
                    onClick={() => setAgentState(state)}
                    variant={agentState === state ? "default" : "outline"}
                    className="w-full"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Volume Mode */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Volume Control</h3>
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setVolumeMode("auto")}
                  variant={volumeMode === "auto" ? "default" : "outline"}
                  className="flex-1"
                >
                  Auto
                </Button>
                <Button
                  onClick={() => setVolumeMode("manual")}
                  variant={volumeMode === "manual" ? "default" : "outline"}
                  className="flex-1"
                >
                  Manual
                </Button>
              </div>

              {volumeMode === "manual" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Input Volume: {manualInput.toFixed(2)}
                    </label>
                    <Slider
                      value={[manualInput]}
                      onValueChange={([value]) => setManualInput(value)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Output Volume: {manualOutput.toFixed(2)}
                    </label>
                    <Slider
                      value={[manualOutput]}
                      onValueChange={([value]) => setManualOutput(value)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Color Presets */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Color Themes</h3>
              <div className="space-y-2">
                {presetColors.map((preset) => (
                  <Button
                    key={preset.name}
                    onClick={() => setColors(preset.colors)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: preset.colors[0] }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: preset.colors[1] }}
                        />
                      </div>
                      <span>{preset.name}</span>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={colors[0]}
                    onChange={(e) => setColors([e.target.value, colors[1]])}
                    className="w-full h-10 rounded-md cursor-pointer border border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={colors[1]}
                    onChange={(e) => setColors([colors[0], e.target.value])}
                    className="w-full h-10 rounded-md cursor-pointer border border-border"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <Card className="mt-8 p-6 bg-card border-border max-w-7xl mx-auto">
          <h3 className="text-lg font-semibold mb-3">About the Orb</h3>
          <p className="text-muted-foreground leading-relaxed">
            This interactive 3D orb uses WebGL shaders and React Three Fiber to create a stunning visual effect. 
            The orb responds to different agent states, simulating behaviors like thinking, listening, and talking. 
            You can customize colors, control volume levels manually or let them animate automatically, and watch 
            the orb transform in real-time.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Index;
