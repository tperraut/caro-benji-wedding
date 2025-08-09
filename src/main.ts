import kaplay from "kaplay";
import "kaplay/global";
import {createInstructionsScene} from "./scenes/instructions";
import {createLevel1Scene} from "./scenes/level1";
import {createLevel2Scene} from "./scenes/level2";
import {createLevel3Scene} from "./scenes/level3";

kaplay({
  width: 960,
  height: 540,
  scale: 2,
  stretch: true,
  letterbox: true,
  texFilter: "linear", // Use linear filtering for smoother scaling
});

loadSprite("startBG", "sprites/heading.jpg", {singular: true});
loadSprite("level1", "sprites/level_1.jpg", {singular: true});
loadSprite("level1BG", "sprites/jardin.jpg", {singular: true});
loadSprite("ollie", "sprites/ollie_run.png", {singular: true});
loadSprite("ollie_jump", "sprites/ollie_jump.png", {singular: true});
loadSprite("ollie_hit", "sprites/ollie_hit.png", {singular: true});
loadSprite("duif", "sprites/duif.png", {singular: true});
loadSprite("robot", "sprites/robot.png", {singular: true});


loadSprite("level2", "sprites/level_2.jpg", {singular: true});
loadSprite("level2BG", "sprites/cuisine.jpg", {singular: true});
loadSprite("sakiro_idle", "sprites/sakiro_idle.png"), {singular: true};
loadSprite("sakiro_hit", "sprites/sakiro_hit.png", {singular: true});
loadSprite("broccoli", "sprites/broccoli.png", {singular: true});
loadSprite("garnaal", "sprites/garnaal.png", {singular: true});
loadSprite("kaas", "sprites/kaas.png", {singular: true});
loadSprite("salami", "sprites/salami.png", {singular: true});

loadSound("hit", "sounds/meow.wav");
loadSound("eat", "sounds/pop.wav");
loadSound("god", "sounds/godverdoeme.ogg");
loadSound("kebab", "sounds/kebab.ogg");
loadSound("paljas", "sounds/paljas.ogg");
loadSound("ela", "sounds/ela.ogg");
loadSound("mo-joenge-toch", "sounds/mo-joenge-toch.ogg");


loadSprite("level3", "sprites/level_3.jpg", {singular: true});
loadSprite("level3BG", "sprites/level_3_bg.jpg", {singular: true});
loadSprite("bike_girl", "sprites/bike_girl.png", {singular: true});
loadSprite("bike_boy", "sprites/bike_boy.png", {singular: true});
loadSprite("camion_red", "sprites/camion_red.png", {singular: true});
loadSprite("camion_white", "sprites/camion_white.png", {singular: true});
loadSprite("car", "sprites/car.png", {singular: true});
loadSprite("double_bike", "sprites/double_bike.png", {singular: true});
loadSprite("kebab", "sprites/kebab.png", {singular: true});
loadSprite("maire", "sprites/maire.png", {singular: true});
loadSprite("panneau", "sprites/panneau.png", {singular: true});
loadSprite("shopping_girl", "sprites/shopping_girl.png", {singular: true});
loadSprite("sport_car", "sprites/sport_car.png", {singular: true});
loadSprite("hole", "sprites/hole.png", {singular: true});
loadSprite("benji", "sprites/benjimoto.png", {singular: true});

setGravity(1000);
createInstructionsScene();
createLevel1Scene();
createLevel2Scene();
createLevel3Scene();

go("instructions", {asset: "startBG", sceneToGo: "instructions", isStart: true});
// go("level2");