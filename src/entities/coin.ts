import {Vec2, Anchor} from "kaplay"

const coins = [
  "garnaal",
  "broccoli",
  "salami",
]

export function createCoin(
  speed: number = 300,
  moveDirection: Vec2 = DOWN,
  p: Vec2 = vec2(randi(20, width() - 20), -20),
  anch: Anchor = "center",
) {
  const res = add([
    "coin",
    sprite(coins[randi(0, coins.length)]),
    scale(vec2(0.28, 0.28)),
    pos(p.x, p.y),
    anchor(anch),
    area({collisionIgnore: ["ground"]}),
    move(moveDirection, speed),
    {
      hit: false,
    }
  ]);
  return res;
}