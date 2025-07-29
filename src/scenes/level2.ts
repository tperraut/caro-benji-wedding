import {createCoin} from "../entities/coin";
import {createEnnemi} from "../entities/ennemi";
import {createPlayer} from "../entities/player";

let ennemiSpeed = 300;
let score = 0;

function spawnEnnemis() {
  const speed = ennemiSpeed + 3 * score
  randi(0, 10) < 2
    ? createEnnemi("kaas", speed, DOWN, vec2(randi(20, width() - 20), -20), vec2(0.24, 0.24
    ), "center")
    : createCoin(speed);

  wait(rand(150 / speed, 350 / speed), () => {
    spawnEnnemis();
  });
}

export function createLevel2Scene() {
  return scene("level2", () => {
    setGravity(0);
    score = 0;

    add([pos(0, 0), rect(width(), height()), color("#FFFFFF")])
    add(["background", sprite("level2BG")])
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
          score = clamp(score - 5, 0, score);
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
      if (score >= 60) {
        go("instructions", {asset: "level3", sceneToGo: "level3"});
      }
    })

    let mouseEnabled = true;
    let lastX = 0;
    const delta = 5;
    onUpdate(() => {
      if (!mouseEnabled) return;
      const nextX = mousePos().x;
      player.pos.x = clamp(nextX, player.width * player.scale.x / 2, width() - player.width * player.scale.x / 2);
      if (player.pos.x - lastX > delta) {
        player.flipX = false;
        lastX = player.pos.x;
      } else if (player.pos.x - lastX < -delta) {
        player.flipX = true;
        lastX = player.pos.x;
      };
    });


    spawnEnnemis();


    onClick(() => {
      mouseEnabled = true;
    });
    onTouchStart(() => {
      mouseEnabled = true;
    });

    onKeyPressRepeat("left", () => {
      mouseEnabled = false;
      player.flipX = true;
      const nextX = player.pos.x - player.width * player.scale.x;
      player.pos.x = clamp(nextX, player.width * player.scale.x / 2, width());
    });
    onKeyPressRepeat("right", () => {
      mouseEnabled = false;
      player.flipX = false;
      const nextX = player.pos.x + player.width * player.scale.x;
      player.pos.x = clamp(nextX, 0, width() - player.width * player.scale.x / 2);
    });
  });
}
