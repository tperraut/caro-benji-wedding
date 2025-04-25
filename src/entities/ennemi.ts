import {Vec2, Anchor} from "kaplay"

export function createEnnemi(
  img: string,
  speed: number = 300,
  moveDirection: Vec2 = LEFT,
  p: Vec2 = vec2(width(), height() - 20),
  s: Vec2 = vec2(0.5, 0.5),
  anch: Anchor = "botleft"
) {
  const res = add([
    "ennemi",
    sprite(img),
    scale(s),
    pos(p.x, p.y),
    anchor(anch),
    area(),
    move(moveDirection, speed),
    {
      hit: false,
    }
  ]);
  return res;
}