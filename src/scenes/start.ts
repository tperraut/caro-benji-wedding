export function createStartScene() {
  return scene("start", () => {
    add([sprite("startBG")])
    const t = add([
      text("Tap to start"),
      pos(center().x, height() - 120), color("#000000"),
      anchor("center"),
      animate(),
    ])
    t.animate("scale", [vec2(1, 1), vec2(1.2, 1.2), vec2(1, 1)], {duration: 2})
    t.animate("opacity", [0.5, 1, 0.5], {duration: 2})

    onKeyPress("space", () => {
      go("level1");
    });
    onClick(() => {
      go("level1");
    });
    onTouchStart(() => {
      go("level1");
    });
  });
}
