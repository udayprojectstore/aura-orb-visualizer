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

  // now supports N stops (string[])
  const [colors, setColors] = useState<string[]>(["#CADCFC", "#A0B9D1"]);

  const stateButtons: { state: AgentState; label: string }[] = [
    { state: null, label: "Idle" },
    { state: "thinking", label: "Thinking" },
    { state: "listening", label: "Listening" },
    { state: "talking", label: "Talking" },
  ];

  // Preset list now accepts arrays of any length (2..6)
  const presetColors: Array<{ name: string; colors: string[] }> = [
    { name: "Ocean", colors: ["#CADCFC", "#A0B9D1"] },
    { name: "Sunset", colors: ["#FF6B6B", "#FFA07A"] },
    { name: "Forest", colors: ["#90EE90", "#3CB371"] },
    { name: "Purple Dream", colors: ["#DDA0DD", "#BA55D3"] },
    { name: "Cyber", colors: ["#00FFFF", "#00CED1"] },
    { name: "Ice", colors: ["#A3E4FF", "#F6A9FF"] },

    // OG Six-Color Metal Aura (full 6-stop palette)
    {
      name: "OG Metal Aura",
      colors: [
        "#e6c9bf", // soft pink-beige highlight
        "#d2b5aa", // warm blush
        "#cbaea3", // subtle tan
        "#d4b5ab", // mid neutral
        "#e5c3bd", // silvery blush
        "#d9bcb1", // cool rose metallic
      ],
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
                {/* Pass the full colors array (2..6) */}
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
                        {/* show first two stops as swatches (works for 2..6) */}
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: preset.colors[0] ?? "#000000" }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: preset.colors[1] ?? preset.colors[0] ?? "#000000" }}
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
                    value={colors[0] ?? "#ffffff"}
                    onChange={(e) =>
                      setColors((prev) => {
                        const next = prev.slice();
                        // replace first stop
                        next[0] = e.target.value;
                        // ensure at least two stops exist
                        if (next.length === 1) next[1] = e.target.value;
                        return next;
                      })
                    }
                    className="w-full h-10 rounded-md cursor-pointer border border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={colors[1] ?? colors[0] ?? "#ffffff"}
                    onChange={(e) =>
                      setColors((prev) => {
                        const next = prev.slice();
                        // replace second stop (preserve further stops)
                        if (next.length >= 2) {
                          next[1] = e.target.value;
                        } else {
                          // if only one stop existed, push new second stop
                          next[1] = e.target.value;
                        }
                        return next;
                      })
                    }
                    className="w-full h-10 rounded-md cursor-pointer border border-border"
                  />
                </div>

                {/* If current colors contain more than 2 stops, show them as small swatches */}
                {colors.length > 2 && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Extra Stops
                    </label>
                    <div className="flex gap-2 items-center">
                      {colors.map((c, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div
                            className="w-8 h-8 rounded-md border border-border"
                            style={{ backgroundColor: c }}
                          />
                          <span className="text-xs text-muted-foreground mt-1">{i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      To edit extra stops you can re-apply a preset or modify the Orb call with a custom array.
                    </p>
                  </div>
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
