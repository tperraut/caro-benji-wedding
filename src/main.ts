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
loadSprite("startBG", "public/sprites/heading.png");
loadSprite("forest", "public/sprites/forest.png");
loadSprite("ollie", "public/sprites/ollie_run.png");
loadSprite("ollie_jump", "public/sprites/ollie_jump.png");
loadSprite("ollie_hit", "public/sprites/ollie_hit.png");
loadSprite("strandmon", "public/sprites/strandmon.png");

loadSprite("sakiro_idle", "public/sprites/sakiro_idle.png");
loadSprite("sakiro_hit", "public/sprites/sakiro_hit.png");
loadSprite("broccoli", "public/sprites/broccoli.png");
loadSprite("garnaal", "public/sprites/garnaal.png");
loadSprite("kaas", "public/sprites/kaas.png");
loadSprite("salami", "public/sprites/salami.png");

loadSound("hit", "public/sounds/meow.wav");
loadSound("eat", "public/sounds/pop.wav");

setGravity(1000);
createStartScene();
createLevel1Scene();
createLevel2Scene();

go("start");
// go("level2");