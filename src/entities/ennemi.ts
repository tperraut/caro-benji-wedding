export function createEnnemi(img: string) {
  const res = add([
    "ennemi",
    sprite(img),
    scale(vec2(0.1, 0.1)),
    pos(width(), height() - 20),
    anchor("botleft"),
    area(),
    move(LEFT, 300),
    {
      hit: false,
    }
  ]);
  return res;
}