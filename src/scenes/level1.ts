import {createEnnemi} from "../entities/ennemi";
import {createPlayer} from "../entities/player";

function spawnEnnemi() {
  createEnnemi("strandmon");

  wait(rand(1.5, 3.5), () => {
    spawnEnnemi();
  });
}


export function createLevel1Scene() {
  return scene("level1", () => {
    let score = 0

    add(["background", sprite("forest")])
    add(["ground", rect(3 * width(), 20), body({isStatic: true}), pos(-width(), height() - 20), area(), color("#FF0000"), opacity(0)])
    const scoreboard = add([text(`Score: ${score}`), color("#000000"), pos(16, 16)])

    const despawner = add(["despawner", rect(20, 3 * height()), body({isStatic: true}), pos(- 100, -height()), area(), color("#FF0000"), opacity(1)])
    despawner.onCollide("ennemi", (obj) => {
      console.log("despawn");
      obj.destroy();
      if (obj.hit) return;
      score++;
      scoreboard.text = `Score: ${score}`;
    });


    const player = createPlayer(
      {idle: "ollie", jump: "ollie_jump", hit: "ollie_hit", p: vec2(16, 520)}
    )

    onKeyPress("space", () => {
      if (player.isGrounded()) {
        player.tryJump()
      }
    });


    spawnEnnemi();
  });
}
