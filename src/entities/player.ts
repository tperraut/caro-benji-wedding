import {Anchor, GameObj, Vec2} from "kaplay";
import {blink} from "../components/blink";

export function createPlayer({idle, jump, hit, p, anch, onEnnemiHit}: {idle: string, jump?: string, hit: string, p: Vec2, anch?: Anchor, onEnnemiHit?: (v: GameObj) => void}) {
  const res = add([
    "player",
    sprite(idle),
    scale(vec2(0.2, 0.2)),
    pos(p.x, p.y),
    anchor(anch ?? "botleft"),
    area(),
    animate(),
    body({jumpForce: 700}),
    blink(),
    {
      hit: false,
      tryJump() {
        if (this.isGrounded()) {
          if (!res.hit) {
            this.sprite = jump ?? idle;
          }
          this.jump();
        }
      }
    }
  ]);

  res.onGround(() => {
    if (!res.hit) {
      res.sprite = idle;
    }
  });

  res.onCollide("ennemi", (obj) => {
    if (!obj.hit && !res.hit) {
      obj.hit = true;
      res.hit = true;
      res.sprite = hit;
      play("hit", {volume: 0.5});
      shake();
      res.blink({
        duration: 2,
        loops: 10,
        onFinish: () => {
          res.sprite = res.isGrounded() ? idle : jump ?? idle;
          res.hit = false;
        }
      });
      onEnnemiHit?.(obj);
    }
  });

  return res;
}