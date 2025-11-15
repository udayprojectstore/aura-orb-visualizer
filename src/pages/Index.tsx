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
  const [colors, setColors] = useState<string[]>(["#CADCFC", "#A0B9D1", "#E8F3FF", "#6B9BD1", "#4A7BA7", "#89B5E0"]);
  const [jitterEnabled, setJitterEnabled] = useState(true);
  const [jitterIntensity, setJitterIntensity] = useState(0.5);

  const stateButtons: { state: AgentState; label: string }[] = [
    { state: null, label: "Idle" },
    { state: "thinking", label: "Thinking" },
    { state: "listening", label: "Listening" },
    { state: "talking", label: "Talking" },
  ];

  const presetColors: Array<{ name: string; colors: string[] }> = [
    { 
      name: "Ocean Breeze", 
      colors: ["#CADCFC", "#A0B9D1", "#E8F3FF", "#6B9BD1", "#4A7BA7", "#89B5E0"] 
    },
    { 
      name: "Sunset Glow", 
      colors: ["#FF6B6B", "#FFA07A", "#FFD93D", "#FF8E53", "#FA5F55", "#FFCBA4"] 
    },
    { 
      name: "Forest Mist", 
      colors: ["#90EE90", "#3CB371", "#98D8C8", "#2D8B57", "#6FDC8C", "#B4EEB4"] 
    },
    { 
      name: "Purple Dream", 
      colors: ["#DDA0DD", "#BA55D3", "#E6B0FF", "#9B59B6", "#D68FD6", "#C68FE6"] 
    },
    { 
      name: "Cyber Pulse", 
      colors: ["#00FFFF", "#00CED1", "#40E0D0", "#00B8D4", "#5DDEF4", "#26C6DA"] 
    },
    { 
      name: "Midnight Aurora", 
      colors: ["#1A1A2E", "#0F3460", "#16213E", "#533483", "#7B2CBF", "#9D4EDD"] 
    },
    { 
      name: "Tropical Paradise", 
      colors: ["#FF6B9D", "#FEC260", "#12CBC4", "#FDA7DF", "#F38181", "#AA96DA"] 
    },
    { 
      name: "Golden Hour", 
      colors: ["#F4A261", "#E76F51", "#E9C46A", "#D4A373", "#F2CC8F", "#E07A5F"] 
    },
    { 
      name: "Northern Lights", 
      colors: ["#A8DADC", "#457B9D", "#1D3557", "#2A9D8F", "#264653", "#81B29A"] 
    },
    { 
      name: "Rose Gold", 
      colors: ["#e6c9bf", "#d2b5aa", "#cbaea3", "#d4b5ab", "#e5c3bd", "#d9bcb1"] 
    },
    { 
      name: "Ice Crystal", 
      colors: ["#A3E4FF", "#F6A9FF", "#D1F4FF", "#E8B4F8", "#B8E6FF", "#FFFFFF"] 
    },
    { 
      name: "Lava Flow", 
      colors: ["#FF4500", "#FF6347", "#FF8C00", "#DC143C", "#B22222", "#8B0000"] 
    },
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
                  jitterEnabled={jitterEnabled}
                  jitterIntensity={jitterIntensity}
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

            {/* Jitter Control */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4">Jitter Effect</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Enable Jitter</label>
                  <Button
                    onClick={() => setJitterEnabled(!jitterEnabled)}
                    variant={jitterEnabled ? "default" : "outline"}
                    size="sm"
                  >
                    {jitterEnabled ? "ON" : "OFF"}
                  </Button>
                </div>
                {jitterEnabled && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Intensity: {jitterIntensity.toFixed(2)}
                    </label>
                    <Slider
                      value={[jitterIntensity]}
                      onValueChange={([value]) => setJitterIntensity(value)}
                      min={0}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
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
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex gap-1 flex-wrap">
                        {preset.colors.slice(0, 6).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="flex-1">{preset.name}</span>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="text-sm font-medium mb-3">Custom Colors</div>
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground min-w-[60px]">
                      Color {index + 1}
                    </label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...colors];
                        newColors[index] = e.target.value;
                        setColors(newColors);
                      }}
                      className="flex-1 h-10 rounded-md cursor-pointer border border-border"
                    />
                    {colors.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newColors = colors.filter((_, i) => i !== index);
                          setColors(newColors);
                        }}
                        className="h-10 w-10 p-0"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                {colors.length < 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setColors([...colors, "#FFFFFF"]);
                    }}
                    className="w-full"
                  >
                    + Add Color
                  </Button>
                )}
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
