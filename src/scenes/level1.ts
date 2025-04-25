import {createEnnemi} from "../entities/ennemi";
import {createPlayer} from "../entities/player";

let ennemiSpeed = 300;
const ennemiTypes = [
  "robot",
  "duif",
]

function spawnEnnemis() {
  const ennemiType = ennemiTypes[randi(0, ennemiTypes.length)];
  createEnnemi(ennemiType, ennemiSpeed);

  wait(rand(450 / ennemiSpeed, 1050 / ennemiSpeed), () => {
    spawnEnnemis();
  });
}

function updateSpeed() {
  wait(5, () => {
    ennemiSpeed += 10;
    updateSpeed();
  });
}

export function createLevel1Scene() {
  return scene("level1", () => {
    let score = 0

    add([pos(0, 0), rect(width(), height()), color("#FFFFFF")])
    add(["background", sprite("level1BG")])
    add(["ground", rect(3 * width(), 20), body({isStatic: true}), pos(-width(), height() - 20), area(), color("#FF0000"), opacity(0)])
    const scoreboard = add([text(`Score: ${score}`), color("#000000"), pos(16, 16)])

    const despawner = add(["despawner", rect(20, 3 * height()), body({isStatic: true}), pos(-100, -height()), area(), color("#FF0000"), opacity(0)])
    despawner.onCollide("ennemi", (obj) => {
      obj.destroy();
      if (obj.hit) return;
      score++;
      scoreboard.text = `Score: ${score}`;
      if (score >= 15) {
        go("instructions", {asset: "level2", sceneToGo: "level2"});
      }
    });


    const player = createPlayer(
      {idle: "ollie", jump: "ollie_jump", hit: "ollie_hit", p: vec2(16, 520)}
    )


    function jumpAction() {
      if (player.isGrounded()) {
        player.tryJump()
      }
    }
    onKeyPress("space", () => {
      jumpAction();
    });
    onClick(() => {
      jumpAction();
    });
    onTouchStart(() => {
      jumpAction();
    });


    spawnEnnemis();
    updateSpeed();
  });
}
