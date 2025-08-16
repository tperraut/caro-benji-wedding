interface InstructionsSceneProps {
  asset?: string;
  sceneToGo?: string;
  animateToNext?: boolean;
  tapText?: string;
  isEnd?: boolean;
  duration?: number;
  extra?: InstructionsSceneProps;
}

export function createInstructionsScene() {
  return scene("instructions", ({
    asset = "level1",
    sceneToGo = "level1",
    animateToNext = true,
    tapText = "Tap to start",
    isEnd = false,
    duration = 7,
    extra = {}
  }: InstructionsSceneProps) => {
    add([pos(0, 0), rect(width(), height()), color("#FFFFFF")])
    const bg = add([sprite(asset), animate(), scale(0.5)])
    if (animateToNext) {
      bg.onAnimateFinished(() => {
        go(sceneToGo, {});
      })
      bg.animate("opacity", [1, 1, 0], {duration: duration, loops: 1})
      return;
    }

    if (isEnd) {
      return;
    }

    const t = add([
      text(tapText),
      pos(center().x, height() - 120), color("#000000"),
      anchor("center"),
      animate(),
    ])
    t.animate("scale", [vec2(1, 1), vec2(1.2, 1.2), vec2(1, 1)], {duration: 2})
    t.animate("opacity", [0.5, 1, 0.5], {duration: 2})

    onKeyPress("space", () => {
      go(sceneToGo, extra);
    });
    onClick(() => {
      go(sceneToGo, extra);
    });
    onTouchStart(() => {
      go(sceneToGo, extra);
    });
  });
}