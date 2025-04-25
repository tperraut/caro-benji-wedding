interface InstructionsSceneProps {
  asset?: string;
  sceneToGo?: string;
  isStart?: boolean;
}

export function createInstructionsScene() {
  return scene("instructions", ({
    asset = "level1",
    sceneToGo = "level1",
    isStart = false,
  }: InstructionsSceneProps) => {
    add([pos(0, 0), rect(width(), height()), color("#FFFFFF")])
    const bg = add([sprite(asset), animate()])
    if (!isStart) {
      bg.onAnimateFinished(() => {
        go(sceneToGo, {});
      })
      bg.animate("opacity", [1, 1, 0], {duration: 7, loops: 1})
      return;
    }
    const t = add([
      text("Tap to start"),
      pos(center().x, height() - 120), color("#000000"),
      anchor("center"),
      animate(),
    ])
    t.animate("scale", [vec2(1, 1), vec2(1.2, 1.2), vec2(1, 1)], {duration: 2})
    t.animate("opacity", [0.5, 1, 0.5], {duration: 2})

    onKeyPress("space", () => {
      go(sceneToGo, {});
    });
    onClick(() => {
      go(sceneToGo, {});
    });
    onTouchStart(() => {
      go(sceneToGo, {});
    });
  });
}