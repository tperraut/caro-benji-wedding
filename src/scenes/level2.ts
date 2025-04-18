import {createCoin} from "../entities/coin";
import {createEnnemi} from "../entities/ennemi";
import {createPlayer} from "../entities/player";

let ennemiSpeed = 300;
let score = 0;

function spawnEnnemis() {
  const speed = ennemiSpeed + 3 * score
  randi(0, 10) < 2
    ? createEnnemi("kaas", speed, DOWN, vec2(randi(20, width() - 20), -20), vec2(0.06, 0.06), "center")
    : createCoin(speed);

  wait(rand(150 / speed, 350 / speed), () => {
    spawnEnnemis();
  });
}

export function createLevel2Scene() {
  return scene("level2", () => {
    setGravity(0);
    score = 0;

    add(["background", sprite("forest")])
    add(["ground", rect(3 * width(), 20), body({isStatic: true}), pos(-width(), height()), area(), color("#FF0000"), opacity(0)])
    const scoreboard = add([text(`Score: ${score}`), color("#000000"), pos(16, 16)])

    const despawner = add(["despawner", rect(3 * width(), 20), body({isStatic: true}), pos(-width(), height() + 100), area(), color("#FF0000"), opacity(0)])
    despawner.onCollide((obj) => {
      obj.destroy();
    });


    const player = createPlayer(
      {
        idle: "sakiro_idle", hit: "sakiro_hit", p: vec2(width() / 2, height()), anch: "bot", onEnnemiHit: (obj) => {
          obj.destroy();
          player.scale = vec2(clamp(player.scale.x - 0.1, 0.2, player.scale.x), clamp(player.scale.y - 0.1, 0.2, player.scale.y));
          score = clamp(score - 10, 0, score);
          scoreboard.text = `Score: ${score}`;
        }
      }
    )

    player.onCollide("ennemi", (obj) => {
    })

    player.onCollide("coin", (obj) => {
      if (obj.sprite != "broccoli") {
        player.scale = vec2(clamp(player.scale.x + 0.006, 0.2, player.scale.x + 0.01), clamp(player.scale.y + 0.006, 0.2, player.scale.y + 0.01));
      }
      obj.destroy();
      play("eat", {volume: 0.5});
      score++;
      scoreboard.text = `Score: ${score}`;
    })
    onUpdate(() => {
      player.pos.x = mousePos().x;
    });


    spawnEnnemis();
  });
}
