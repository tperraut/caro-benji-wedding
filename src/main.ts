import kaplay from "kaplay";
import "kaplay/global";
import {createLevel1Scene} from "./scenes/level1";
import {createLevel2Scene} from "./scenes/level2";
import {createInstructionsScene} from "./scenes/instructions";

kaplay({
  width: 960,
  height: 540,
  scale: 1,
  stretch: true,
  letterbox: true,
});

loadSprite("startBG", "sprites/heading.jpg");
loadSprite("level1", "sprites/level_1.jpg");
loadSprite("level1BG", "sprites/jardin.jpg");
loadSprite("ollie", "sprites/ollie_run.png");
loadSprite("ollie_jump", "sprites/ollie_jump.png");
loadSprite("ollie_hit", "sprites/ollie_hit.png");
loadSprite("duif", "sprites/duif.png");
loadSprite("robot", "sprites/robot.png");


loadSprite("level2", "sprites/level_2.jpg");
loadSprite("level2BG", "sprites/cuisine.jpg");
loadSprite("sakiro_idle", "sprites/sakiro_idle.png");
loadSprite("sakiro_hit", "sprites/sakiro_hit.png");
loadSprite("broccoli", "sprites/broccoli.png");
loadSprite("garnaal", "sprites/garnaal.png");
loadSprite("kaas", "sprites/kaas.png");
loadSprite("salami", "sprites/salami.png");

loadSound("hit", "sounds/meow.wav");
loadSound("eat", "sounds/pop.wav");


loadSprite("level3", "sprites/level_3.jpg");

setGravity(1000);
createInstructionsScene();
createLevel1Scene();
createLevel2Scene();

go("instructions", {asset: "startBG", sceneToGo: "instructions", isStart: true});
// go("level2");