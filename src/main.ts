import kaplay from "kaplay";
import "kaplay/global";
import {createStartScene} from "./scenes/start";
import {createLevel1Scene} from "./scenes/level1";
import {createLevel2Scene} from "./scenes/level2";

kaplay({
  width: 960,
  height: 540,
  scale: 1,
  stretch: true,
  letterbox: true,
});

loadRoot("./"); // A good idea for Itch.io publishing later
loadSprite("startBG", "sprites/heading.png");
loadSprite("forest", "sprites/forest.png");
loadSprite("ollie", "sprites/ollie_run.png");
loadSprite("ollie_jump", "sprites/ollie_jump.png");
loadSprite("ollie_hit", "sprites/ollie_hit.png");
loadSprite("strandmon", "sprites/strandmon.png");

loadSprite("sakiro_idle", "sprites/sakiro_idle.png");
loadSprite("sakiro_hit", "sprites/sakiro_hit.png");
loadSprite("broccoli", "sprites/broccoli.png");
loadSprite("garnaal", "sprites/garnaal.png");
loadSprite("kaas", "sprites/kaas.png");
loadSprite("salami", "sprites/salami.png");

loadSound("hit", "sounds/meow.wav");
loadSound("eat", "sounds/pop.wav");

setGravity(1000);
createStartScene();
createLevel1Scene();
createLevel2Scene();

go("start");
// go("level2");