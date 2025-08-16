import {AnimateComp, AudioPlay, GameObj, Vec2} from "kaplay";
import {blink} from "../components/blink";
import {followPath} from "../components/followPath";
import {formatTime} from "../utils";

const IS_DEBUG = false;
const ACTIVATE_INSPECT = false;
const ENABLE_COLLISION = true;
const PLAYER_DEFAULT_SPEED = 200;
const VOLUME_DEFAULT = 0.25;

let WIN_AUDIO_PLAYER: AudioPlay | null = null;
let LOSE_AUDIO_PLAYER: AudioPlay | null = null;

const ASSET_SCALE = {
  bike_boy: 0.06,
  bike_girl: 0.06,
  boat: 0.3,
  double_bike: 0.08,
  uber1: 0.07,
  uber2: 0.07,
  shopping_girl: 0.27,
  shopping1: 0.06,
  shopping2: 0.06,
  shopping3: 0.06,
  shopping4: 0.06,
  old_boy1: 0.06,
  old_boy2: 0.06,
  old_girl1: 0.06,
  old_girl2: 0.06,
  kebab: 0.05,
  hole: 0.2,
  shalom1: 0.07,
  shalom2: 0.07,
  sport_car: 0.17,
  car: 0.15,
  camion_red: 0.37,
  camion_white: 0.3,
  policeman: 0.5,
  trott1: 0.07,
  trott2: 0.07,
  trott3: 0.07,
  mayer: 0.06,
  tourist: 0.06,
};

const IGNORE_LIST = Object.keys(ASSET_SCALE);


function drawHole(p: Vec2) {
  return add([
    pos(p),
    sprite("hole"),
    anchor("center"),
    scale(ASSET_SCALE.hole),
    area(),
    body({isStatic: true}),
    outline(3, rgb(255, 0, 0), IS_DEBUG ? 1 : 0),
    "hole"
  ]);
}

function drawRoad(path: Vec2[]) {
  if (path.length < 2) return;

  return add([
    pos(0, 0),
    polygon(path, {fill: false}),
    area(),
    body({isStatic: true}),
    color("#000000"),
    outline(3, rgb(255, 0, 0), IS_DEBUG ? 1 : 0),
    "road",
    {myId: `${path[0]}`},
  ]);
}

const BIKE_TYPES = ["bike_boy", "bike_girl", "double_bike"];

function drawBike(path: Vec2[]) {
  if (path.length < 2) return;

  const bikeType = BIKE_TYPES[randi(BIKE_TYPES.length)];
  const typeScale = ASSET_SCALE[bikeType];
  return add([
    pos(path[0]),
    sprite(bikeType),
    scale(typeScale),
    anchor("center"),
    area({collisionIgnore: IGNORE_LIST}),
    body({isStatic: true}),
    rotate(),
    followPath({
      path: path, offsetY: 80
    }),
    "bicycle",
  ]);
}

const UBER_TYPES = ["uber1", "uber2"];

interface UberProps {
  path: Vec2[];
  pauseAt?: Vec2[];
}

function drawUber({path, pauseAt}: UberProps) {
  if (path.length < 2) return;

  const _type = UBER_TYPES[randi(UBER_TYPES.length)];
  const typeScale = ASSET_SCALE[_type];
  return add([
    pos(path[0]),
    sprite(_type),
    scale(typeScale),
    anchor("center"),
    area({collisionIgnore: IGNORE_LIST}),
    body({isStatic: true}),
    rotate(),
    followPath({
      path: path,
      pauseDelay: randi(3, 10),
      pauseAt: pauseAt
    }),
    {
      isPaused: false,
      speed: 80
    },
    "bicycle",
  ]);
}
const TROTT_TYPES = ["trott1", "trott2", "trott3"];

interface TrottProps {
  path: Vec2[];
  pauseAt?: Vec2[];
}

function drawTrott({path, pauseAt}: TrottProps) {
  if (path.length < 2) return;

  const _type = TROTT_TYPES[randi(TROTT_TYPES.length)];
  const typeScale = ASSET_SCALE[_type];
  return add([
    pos(path[0]),
    sprite(_type),
    scale(typeScale),
    anchor("center"),
    area({collisionIgnore: IGNORE_LIST}),
    body({isStatic: true}),
    rotate(),
    followPath({
      path: path,
      pauseDelay: randi(3, 10),
      pauseAt: pauseAt,
      destroyOnLast: true,
      flipX: _type === "trott2" ? false : true,
    }),
    {
      isPaused: false,
      speed: 70
    },
    "bicycle",
  ]);
}

const OLD_TYPES = ["old_boy1", "old_boy2", "old_girl1", "old_girl2"];

interface OldPeopleProps {
  path: Vec2[];
  types?: string[];
  speed?: number;
  reversedPath?: Vec2[];
  pauseAt?: Vec2[];
  goBackPauseAt?: Vec2[];
  destroyOnLast?: boolean;
}

function drawOldPeople({path, pauseAt, types = OLD_TYPES, speed = 15, destroyOnLast = true}: OldPeopleProps) {
  if (path.length < 2) return;

  const _type = types[randi(types.length)];
  const typeScale = ASSET_SCALE[_type];
  const p = add([
    pos(path[0]),
    sprite(_type),
    scale(typeScale),
    anchor("center"),
    area({collisionIgnore: IGNORE_LIST}),
    body({isStatic: true}),
    rotate(),
    animate(),
    followPath({
      path: path,
      pauseDelay: randi(3, 10),
      pauseAt: pauseAt,
      controlAngle: false,
      destroyOnLast: destroyOnLast,
      onMove(self, lastTargetPos, targetPos, _) {
        self.flipX = (_type == "old_girl2") ? targetPos.x > lastTargetPos.x : targetPos.x <= lastTargetPos.x;
      },
    }),
    {
      isPaused: false,
      speed: speed
    },
    "people",
  ]);


  p.animate("angle", [-10, 10], {duration: speed * 0.027, direction: "ping-pong"});
  return p;
}

function drawKebab(p: Vec2) {
  const e = add([
    pos(p),
    sprite("kebab"),
    anchor("center"),
    scale(ASSET_SCALE.kebab),
    area(),
    animate(),
    "kebab"
  ]);
  e.animate("scale", [vec2(0.05, 0.05), vec2(0.065, 0.065), vec2(0.05, 0.05)], {duration: 2})
  return e;
}


const PEOPLE_TYPES = ["shopping_girl", "shopping1", "shopping2", "shopping3", "shopping4"];

function drawShoppingPeople(peopleSpawns: {door: Vec2, road: Vec2}[]) {
  if (peopleSpawns.length < 2) return;

  const startI = randi(0, peopleSpawns.length)
  const start = peopleSpawns[startI];
  let endI = randi(0, peopleSpawns.length)
  if (endI == startI) {
    endI = (endI + 1) % peopleSpawns.length;
  }
  const end = peopleSpawns[endI];
  const path = [
    start.door, start.road, end.road, end.door
  ]

  const _type = PEOPLE_TYPES[randi(PEOPLE_TYPES.length)];
  const typeScale = ASSET_SCALE[_type];

  const anim = (_type === "shopping_girl") ? {anim: "move"} : {}

  const p = add([
    pos(start.door),
    sprite(_type, anim),
    scale(typeScale),
    anchor("center"),
    area({collisionIgnore: IGNORE_LIST}),
    body({isStatic: true}),
    animate(),
    followPath({
      path: path, controlAngle: false, destroyOnLast: true, onMove(self, lastTargetPos, targetPos, _) {
        self.flipX = (_type == "shopping_girl") ? targetPos.x > lastTargetPos.x : targetPos.x <= lastTargetPos.x;
      },
    }),
    "people",
    {speed: 25}
  ]);
  if (_type != "shopping_girl") {
    p.animate("angle", [-10, 10], {duration: 0.4, direction: "ping-pong"});
  }
  return p;
}

const takenStartPositions: {[key: string]: boolean} = {};
const JEW_TYPES = ["shalom1", "shalom2"];

function drawJew(path: Vec2[]) {
  if (path.length < 2) return;

  path = shuffle(path);
  let startI = randi(path.length);
  let start = path[startI];
  let key = start.toString();
  while (takenStartPositions[key]) {
    startI = randi(path.length);
    start = path[startI];
    key = start.toString();
  }
  takenStartPositions[key] = true;

  const _type = JEW_TYPES[randi(JEW_TYPES.length)];
  const shufflePath = shuffle(path);
  const p = add([
    pos(start),
    sprite(_type),
    scale(ASSET_SCALE[_type]),
    anchor("center"),
    area({collisionIgnore: IGNORE_LIST}),
    body({isStatic: true}),
    rotate(20),
    animate(),
    followPath({
      startI: startI,
      path: shufflePath,
      controlAngle: false,
      pauseAt: shufflePath,
      pauseDelay: 2,
      onMove(self, lastTargetPos, targetPos, angle) {
        (self as unknown as AnimateComp).animation.paused = self.isPaused;
      }
    }),
    "people",
    {speed: 25, isPaused: false}
  ]);

  p.animate("angle", [-10, 10], {duration: 0.2, direction: "ping-pong"});
  p.onUpdate(() => {
    if (p.isPaused) {
      p.angle = 0;
      return;
    }
    p.animation.paused = p.isPaused;
  });

  return p;
}

const VEHICLE_DATA = {
  "sport_car": {speed: 250, zIndex: 1},
  "car": {speed: 150, zIndex: 2},
  "camion_red": {speed: 100, zIndex: 3},
  "camion_white": {speed: 100, zIndex: 3}
};
const VEHICLE_TYPES = ["sport_car", "car", "camion_red", "camion_white"];

function drawVehicle(path: Vec2[]) {
  if (path.length < 2) return;

  const vehicleType = VEHICLE_TYPES[randi(0, VEHICLE_TYPES.length)];
  const vehicleInfos = VEHICLE_DATA[vehicleType];
  add([
    pos(path[0]),
    sprite(vehicleType),
    scale(ASSET_SCALE[vehicleType]),
    anchor("center"),
    area({collisionIgnore: IGNORE_LIST}),
    body({isStatic: true}),
    rotate(),
    outline(3, rgb(255, 0, 0), IS_DEBUG ? 1 : 0),
    followPath({path: path, destroyOnLast: true}),
    z(vehicleInfos.zIndex),
    "car",
    {speed: vehicleInfos.speed}
  ]);

  wait(randi(3, 8), () => drawVehicle(path));
}

function drawWin(path: Vec2[]) {
  if (path.length < 2) return;

  add([
    area({shape: new Polygon(path)}),
    rotate(),
    "win",
  ]);
}

function drawSoundTrigger(path: Vec2[], sound: string) {
  if (path.length < 2) {
    return;
  }
  let isPlaying = false;
  const s = add([
    area({shape: new Polygon(path)}),
    rotate(),
    "sound_trigger",
    {
      playSound: () => {
        if (isPlaying) return;
        isPlaying = true;
        play(sound, {volume: VOLUME_DEFAULT}).onEnd(() => {
          isPlaying = false;
        });
      }
    }
  ]);
  return s;
}

interface BoatProps {
  path: Vec2[],
  takeArea: Vec2[],
  dropPoint: Vec2,
  stops: Vec2[][]
}

function drawBoat({path, takeArea, dropPoint, stops}: BoatProps) {
  if (path.length < 2) return;
  let player: GameObj | null = null;

  const b = add([
    pos(path[0]),
    sprite("boat"),
    scale(ASSET_SCALE.boat),
    anchor("center"),
    area({shape: new Rect(vec2(0, 0), 100, 50), collisionIgnore: ["win"]}),
    rotate(),
    followPath({
      path: path,
      controlAngle: true,
      flipX: false,
    }),
    z(999),
    "boat",
    {speed: 80, isPaused: false}
  ]);
  b.area.shape = new Rect(vec2(0, 0), b.width, b.height + 500);

  const a = add([
    area({shape: new Polygon(takeArea)}),
    "take_area"
  ])

  const mayer = add([
    pos(takeArea[0]),
    sprite("maire"),
    scale(ASSET_SCALE.mayer),
    anchor("center"),
    "maire",
  ]);
  drawSoundTrigger(takeArea, "mayer");


  let playerInArea: GameObj | null = null;
  function takePlayer(obj: GameObj) {
    player = obj;
    player.isReady = false;
  }

  a.onCollide("player", (obj) => {
    playerInArea = obj;
    if (b.isColliding(a) && b.isPaused) {
      takePlayer(obj);
    }
  })
  a.onCollideEnd("player", (_) => {
    playerInArea = undefined;
  })

  for (const stop of stops) {
    add([
      area({shape: new Polygon(stop)}),
      "stop_area"
    ]);
  }

  b.onCollide("stop_area", () => {
    b.isPaused = true;
    wait(5, () => {
      b.isPaused = false;
    });
    if (b.isColliding(a) && playerInArea) {
      takePlayer(playerInArea);
    }
  })

  b.onUpdate(() => {
    if (player == null) return;
    player.pos = b.pos;
    if (player != null && b.hasPoint(dropPoint) && b.isPaused) {
      player.lastGoodPos = dropPoint;
      player.pos = dropPoint;
      player.isReady = true;
      player = null;
    }
  });

  return b;
}


function drawWater(positions: Vec2[]) {
  if (positions.length === 0) {
    return;
  }
  return add([
    polygon(positions, {fill: true}),
    color(144, 218, 237),
    z(5),
    "water"
  ]);
}

function drawPoliceMan(triggerPositions: Vec2[], spritePos: Vec2) {
  let isPlaying = false;

  const p = add([
    pos(spritePos),
    scale(ASSET_SCALE.policeman),
    sprite("policeman"),
    anchor("center")
  ])
  return add([
    area({shape: new Polygon(triggerPositions)}),
    "police",
    {
      playAnim() {
        if (isPlaying) return;
        isPlaying = true;
        p.play("move", {
          onEnd() {
            isPlaying = false;
          }
        });
      }
    }
  ]);
}

export function createLevel3Scene() {
  return scene("level3", () => {
    debug.inspect = ACTIVATE_INSPECT;

    WIN_AUDIO_PLAYER?.stop();
    LOSE_AUDIO_PLAYER?.stop();

    let isMoving = false;
    let targetPos = vec2(0, 0);
    let countdownTime = 180; // 3 minutes

    setGravity(0);

    add([pos(0, 0), rect(width(), height()), color("#FFFFFF")]);
    const background = add([
      "background",
      sprite("level3BG", {fill: true}),
      isTouchscreen() ? scale(vec2(1.5769, 1.5769)) : scale(vec2(1, 1)),
      anchor("topleft"),
    ]);

    const startPos = vec2(6125.517, 1896.784);
    const player = add([
      "player",
      sprite("benji"),
      scale(vec2(0.10, 0.10)),
      pos(startPos),
      ENABLE_COLLISION ? body({isStatic: false, maxVelocity: 0, gravityScale: 0}) : {},
      area({shape: new Rect(vec2(0.0), 250, 200), offset: vec2(-50, 80)}),
      anchor("center"),
      rotate(),
      blink(),
      {
        speed: PLAYER_DEFAULT_SPEED,
        lastGoodPos: startPos,
        isReady: true
      }
    ]);
    const idlePlayerSoundPlayer = play("scooter_engine", {loop: true, volume: 0.2});
    const movingPlayerSoundPlayer = play("scooter_acceleration", {paused: true, volume: 0.1});

    const timerText = add([
      text("00:00", {
        size: 48,
        font: "monospace", // Use monospace for consistent spacing
      }),
      pos(width() / 2, 50),
      anchor("center"),
      color(0, 0, 0),
      layer("ui"),
      z(9999),
      fixed(), // Stay in place when camera moves
    ]);

    function calculateShownSpeed(speed: number): string {
      return `${Math.round(speed * 120) / 200} km/h`;
    }
    const maxSpeedText = add([
      text(`Max Speed: ${calculateShownSpeed(player.speed)}`, {
        size: 20,
        font: "monospace", // Use monospace for consistent spacing
      }),
      pos(width() - 10, height() - 10),
      anchor("botright"),
      color(0, 0, 0),
      layer("ui"),
      z(9999),
      fixed(),
    ]);

    // Get background dimensions for camera bounds
    const bgWidth = background.width * background.scale.x;
    const bgHeight = background.height * background.scale.y;
    const screenWidth = width();
    const screenHeight = height();

    // Camera follows player with bounds checking
    onUpdate(() => {
      countdownTime -= dt();
      if (countdownTime <= 0) {
        countdownTime = 0;
        idlePlayerSoundPlayer.stop();
        movingPlayerSoundPlayer.stop();
        LOSE_AUDIO_PLAYER = play("game_over", {volume: VOLUME_DEFAULT});
        go("instructions", {asset: "game_over", sceneToGo: "instructions", animateToNext: false, tapText: "Tap to retry", extra: {asset: "level3", sceneToGo: "level3", duration: 5}});
        return;
      }
      timerText.text = formatTime(Math.max(0, countdownTime));

      // Calculate desired camera position (center on player)
      let camX = player.pos.x
      let camY = player.pos.y
      camX = clamp(camX, screenWidth / 2, bgWidth - screenWidth / 2);
      camY = clamp(camY, screenHeight / 2, bgHeight - screenHeight / 2);

      // Set camera position
      setCamPos(camX, camY);

      if (isMoving) {
        if (!idlePlayerSoundPlayer.paused) {
          idlePlayerSoundPlayer.stop();
        }
        if (movingPlayerSoundPlayer.paused) {
          movingPlayerSoundPlayer.play();
        }
      } else {
        if (idlePlayerSoundPlayer.paused) {
          idlePlayerSoundPlayer.play();
        }
        if (!movingPlayerSoundPlayer.paused) {
          movingPlayerSoundPlayer.stop();
        }
      }

      if (!isMoving || !player.isReady) {
        return;
      }
      const dist = player.pos.dist(targetPos);
      if (dist < 1) {
        isMoving = false;
        return;
      }

      player.moveTo(targetPos, player.speed);
    });

    onDraw(() => {
      if (isMoving || !player.isReady || isTouchscreen()) return;

      const worldMousePos = toWorld(mousePos());

      // Draw line from player to mouse
      drawLine({
        p1: player.pos,
        p2: worldMousePos,
        width: 1,
        color: rgb(0, 0, 0),
      });

      drawCircle({
        pos: worldMousePos,
        fill: true,
        radius: 2,
        color: rgb(0, 0, 0),
      });
    });


    if (IS_DEBUG) {
      let positions: Vec2[] = [];
      let points: GameObj[] = [];
      onKeyPress("space", () => {
        let toPrint = "";
        for (const p of positions) {
          toPrint += `, vec2(${p.x.toFixed(3)}, ${p.y.toFixed(3)})`;
        }
        console.log(toPrint);
        for (const p of points) {
          p.destroy();
        }
        positions = []; // Clear positions after printing
      });

      let drawn: GameObj | null = null;
      onKeyPress("d", () => {
        drawn = drawRoad(positions);
        // drawn = drawHole(positions[0]);
        // drawn = drawKebab(positions[0]);
      });

      onKeyPress("r", () => {
        drawn?.destroy();
      });

      onClick(() => {
        points.push(add([
          pos(targetPos),
          circle(5, {fill: true}),
          color(0, 0, 255),
        ]));
        positions.push(targetPos); // TODO : remove this line after debugging
      });

      player.onCollide("road", (o, col) => {
        console.log(o.myId)
      });
    }


    onClick(() => {
      if (isMoving || !player.isReady) return;

      targetPos = toWorld(mousePos());
      player.lastGoodPos = player.pos; // Save last good position

      isMoving = true;
      const dir = targetPos.sub(player.pos).unit();
      if (!player.flipX) {
        player.flipX = true;
      }

      // player.moveTo(targetPos, player.speed);

      const angle = dir.angle();
      if (angle < -90 || angle > 90) {
        player.flipY = true;
        player.area.offset.y = -80;
      } else {
        player.flipY = false;
        player.area.offset.y = 80;
      }

      player.angle = angle;
    });


    //#region DRAW ROAD
    drawRoad([
      vec2(6443.733, 1838.744), vec2(6430.229, 1839.882), vec2(5961.678, 1839.895), vec2(5956.823, 1842.226), vec2(5956.085, 1819.915), vec2(5951.994, 1534.443), vec2(5948.245, 1272.380), vec2(6338.473, 1277.304)
    ]);

    drawRoad([
      vec2(5967.854, 1314.796), vec2(5944.180, 1336.330), vec2(5902.295, 1276.867), vec2(5874.733, 1253.496), vec2(5944.770, 1234.749)
    ]);

    drawRoad([
      vec2(5932.732, 1297.631), vec2(5934.726, 1297.125), vec2(5931.039, 1244.486), vec2(5924.448, 1225.326), vec2(5502.217, 1227.457), vec2(5380.891, 1230.641), vec2(5396.101, 1286.882)
    ]);

    drawRoad([
      vec2(5781.304, 1290.773), vec2(5395.983, 1289.596), vec2(5305.784, 999.544), vec2(5302.275, 991.901), vec2(5213.137, 712.461), vec2(5112.326, 454.599), vec2(5016.821, 251.209), vec2(5259.474, 186.521), vec2(5395.657, 458.179), vec2(5496.468, 677.840), vec2(5550.575, 905.610), vec2(5583.636, 1116.694), vec2(5590.003, 1240.497)
    ]);

    drawRoad([
      vec2(5041.144, 271.698), vec2(4685.321, 271.009), vec2(4687.089, 173.381), vec2(5055.667, 170.604)
    ]);

    drawRoad([
      vec2(4693.873, 249.837), vec2(4692.786, 253.728), vec2(4740.892, 317.752), vec2(4775.557, 381.422), vec2(4808.453, 450.397), vec2(4841.349, 523.264), vec2(4873.184, 608.865), vec2(4910.325, 693.404), vec2(4916.780, 709.073), vec2(4818.800, 707.658), vec2(4676.604, 705.182), vec2(4534.531, 702.714), vec2(4392.873, 700.253), vec2(4246.869, 696.730), vec2(4102.197, 695.669)
    ]);

    drawRoad([
      vec2(4207.855, 700.707), vec2(4180.972, 719.454), vec2(4168.592, 735.725), vec2(4168.946, 743.153), vec2(4101.739, 739.970), vec2(4134.529, 686.940)
    ]);

    drawRoad([
      vec2(4172.833, 739.713), vec2(4172.790, 741.274), vec2(4146.265, 727.424), vec2(4092.146, 722.118), vec2(4087.547, 755.014), vec2(4085.779, 987.763), vec2(4086.840, 1164.977), vec2(4170.318, 1163.562)
    ]);

    drawRoad([
      vec2(3534.374, 735.133), vec2(3488.744, 795.619), vec2(3555.364, 798.174)
    ]);

    drawRoad([
      vec2(3488.511, 169.896), vec2(3557.840, 126.389), vec2(3540.861, 231.090)
    ]);

    drawRoad([
      vec2(3509.380, 178.032), vec2(3123.470, 171.311), vec2(2747.464, 163.529), vec2(2748.879, 118.253), vec2(3122.055, 119.668), vec2(3493.816, 123.559)
    ]);

    drawRoad([
      vec2(2783.489, 159.992), vec2(2718.051, 208.452), vec2(2681.264, 144.075)
    ]);

    drawRoad([
      vec2(2739.981, 183.691), vec2(2742.542, 395.571), vec2(2278.459, 379.653), vec2(2048.186, 373.994), vec2(2048.540, 159.992)
    ]);

    drawRoad([
      vec2(2052.879, 279.196), vec2(2004.419, 201.024), vec2(2095.127, 198.548)
    ]);

    drawRoad([
      vec2(2054.803, 224.369), vec2(1764.398, 224.369), vec2(1724.427, 224.016), vec2(1730.087, 172.019), vec2(2060.462, 175.910)
    ]);

    drawRoad([
      vec2(1818.163, 220.125), vec2(1753.078, 269.646), vec2(1743.528, 207.391)
    ]);

    drawRoad([
      vec2(1774.302, 217.295), vec2(1765.105, 491.075), vec2(1502.644, 491.429), vec2(1488.495, 222.955)
    ]);

    drawRoad([
      vec2(1165.551, 1320.345), vec2(987.275, 1582.099), vec2(858.176, 1474.553), vec2(742.156, 1329.174), vec2(861.006, 1203.957)
    ]);

    drawRoad([
      vec2(1023.742, 1519.229), vec2(1025.510, 1739.244), vec2(1025.156, 1956.075), vec2(1024.803, 2172.735), vec2(1024.450, 2389.414), vec2(1024.096, 2606.054), vec2(1023.743, 2822.734), vec2(1023.389, 3035.069), vec2(1023.389, 3272.062), vec2(683.817, 3003.234), vec2(579.115, 2913.742), vec2(573.102, 2909.144), vec2(568.504, 2714.597), vec2(566.735, 2522.527), vec2(566.032, 2332.310), vec2(566.739, 2145.545), vec2(567.093, 1958.780), vec2(567.093, 1863.275), vec2(883.673, 1650.688)
    ]);

    drawRoad([
      vec2(198.791, 2089.303), vec2(294.649, 2022.450), vec2(294.649, 2212.552), vec2(294.649, 2402.500), vec2(294.649, 2592.448), vec2(295.711, 2783.458), vec2(299.248, 2975.529), vec2(306.676, 3101.738), vec2(13.441, 3098.908), vec2(24.406, 2819.114), vec2(21.223, 2562.666), vec2(22.991, 2308.694), vec2(37.494, 2163.668)
    ]);


    drawRoad([
      vec2(364.333, 3088.026), vec2(294.296, 2999.595), vec2(251.849, 3042.396), vec2(293.942, 3103.236)
    ]);

    drawRoad([
      vec2(1726.306, 4082.913), vec2(2121.755, 4289.599), vec2(2123.524, 4373.171), vec2(1678.877, 4186.406)
    ]);

    drawRoad([
      vec2(2049.931, 4304.549), vec2(2094.146, 4271.653), vec2(2464.846, 4415.618), vec2(2458.833, 4433.304)
    ]);

    drawRoad([
      vec2(2348.826, 4367.865), vec2(2540.897, 4424.461), vec2(2538.568, 4445.330), vec2(2335.531, 4436.134)
    ]);

    drawRoad([
      vec2(2461.103, 4403.238), vec2(2665.907, 4437.195), vec2(2637.256, 4475.043), vec2(2446.246, 4448.868)
    ]);

    drawRoad([
      vec2(2606.836, 4428.352), vec2(2918.111, 4427.998), vec2(2905.730, 4464.078), vec2(2602.945, 4473.274)
    ]);

    drawRoad([
      vec2(2815.178, 4429.767), vec2(3093.203, 4401.469), vec2(3139.540, 4460.187), vec2(2813.055, 4477.519)
    ]);

    drawRoad([
      vec2(3066.320, 4403.238), vec2(3405.582, 4345.581), vec2(3468.191, 4431.535), vec2(3084.403, 4463.016)
    ]);

    drawRoad([
      vec2(3263.196, 4371.049), vec2(3630.359, 4279.081), vec2(3687.661, 4396.871), vec2(3308.472, 4434.365)
    ]);

    drawRoad([
      vec2(3518.229, 4310.916), vec2(3903.785, 4168.720), vec2(3984.080, 4350.887), vec2(3546.880, 4397.224)
    ]);

    drawRoad([
      vec2(4751.909, 3583.635), vec2(4913.206, 3322.943), vec2(5073.088, 3075.338), vec2(5232.970, 2828.440), vec2(5392.852, 2581.543), vec2(5853.044, 2582.604), vec2(5854.459, 2795.898), vec2(5857.289, 3004.240), vec2(5689.624, 3198.765), vec2(5522.314, 3392.958), vec2(5383.302, 3547.181)
    ]);

    drawRoad([
      vec2(5523.366, 1753.819), vec2(5460.050, 1507.275), vec2(5426.800, 1400.098), vec2(5659.549, 1401.866)
    ]);

    drawRoad([
      vec2(4742.634, 1623.132), vec2(4831.418, 1561.938), vec2(4839.200, 1650.722)
    ]);

    drawRoad([
      vec2(3851.128, 1442.731), vec2(3947.694, 1495.436), vec2(3886.854, 1540.005)
    ]);

    drawRoad([
      vec2(4207.800, 1289.481), vec2(4371.926, 1199.282), vec2(4343.629, 1335.111)
    ]);

    drawRoad([
      vec2(2500.169, 1614.533), vec2(2594.612, 1668.652), vec2(2607.947, 1570.407)
    ]);

    drawRoad([
      vec2(1445.835, 1073.637), vec2(1302.224, 1307.801), vec2(1313.543, 1411.795), vec2(1326.631, 1526.755), vec2(1349.269, 1744.293), vec2(1488.281, 1839.444), vec2(1879.497, 1839.091), vec2(1993.396, 1840.152), vec2(1992.688, 1627.211), vec2(1991.981, 1414.271), vec2(1991.273, 1201.331), vec2(1990.920, 1086.018)
    ]);

    drawRoad([
      vec2(2048.913, 368.061), vec2(2052.804, 598.333), vec2(2208.795, 603.285), vec2(2209.503, 419.704), vec2(2261.146, 345.776), vec2(2145.479, 276.800)
    ]);

    drawRoad([
      vec2(1012.747, 2955.648), vec2(1077.125, 3026.392), vec2(1070.404, 3114.115), vec2(946.955, 3092.538)
    ]);

    drawRoad([
      vec2(3079.489, 2143.769), vec2(2878.929, 2143.062), vec2(2874.684, 2371.566), vec2(2873.977, 2594.764), vec2(2869.732, 2759.244), vec2(3060.034, 2758.183), vec2(3067.462, 2758.183), vec2(3074.890, 2757.829), vec2(3079.489, 2493.599)
    ]);

    drawRoad([
      vec2(5956.008, 1848.626), vec2(5960.252, 1773.991), vec2(6302.301, 1775.759), vec2(6298.056, 1852.517)
    ]);

    drawRoad([
      vec2(6246.413, 1827.512), vec2(6245.705, 1919.009), vec2(6244.998, 1988.692), vec2(6443.082, 1988.338), vec2(6442.728, 1818.198)
    ]);

    drawRoad([
      vec2(5958.484, 1960.158), vec2(6349.700, 1960.865), vec2(6350.761, 2129.591), vec2(6350.761, 2298.316), vec2(6350.761, 2467.041), vec2(6350.761, 2635.766), vec2(6350.761, 2804.491), vec2(6350.761, 2973.216), vec2(6350.761, 3141.941), vec2(6350.761, 3310.666), vec2(5972.279, 3157.859), vec2(5969.803, 3009.296), vec2(5968.742, 2858.257), vec2(5967.680, 2707.218), vec2(5966.619, 2556.179), vec2(5965.565, 2406.102), vec2(5964.504, 2255.063)
    ]);

    drawRoad([
      vec2(6037.370, 3078.527), vec2(5968.742, 3045.277), vec2(5886.678, 3143.965), vec2(5804.261, 3243.007), vec2(5721.844, 3342.049), vec2(5638.012, 3440.384), vec2(5552.765, 3536.242), vec2(5468.226, 3632.455), vec2(5383.686, 3728.667), vec2(5299.147, 3823.818), vec2(5390.053, 3952.219), vec2(5554.887, 3748.829), vec2(5719.014, 3547.208), vec2(5885.263, 3347.355), vec2(6052.927, 3174.385)
    ]);

    drawRoad([
      vec2(3141.069, 785.256), vec2(3586.016, 781.898), vec2(4030.644, 778.360), vec2(4122.258, 779.068), vec2(4118.013, 963.357), vec2(4117.328, 1164.354), vec2(3699.937, 1169.306), vec2(3282.245, 1170.712), vec2(3138.280, 1169.297)
    ]);

    drawRoad([
      vec2(3525.252, 195.856), vec2(3528.081, 411.488), vec2(3529.850, 553.330), vec2(3531.616, 694.999), vec2(3530.199, 823.581), vec2(3796.552, 817.567), vec2(4078.114, 811.200), vec2(4129.403, 805.541), vec2(4134.002, 617.361), vec2(4131.526, 441.915), vec2(4129.056, 266.933)
    ]);

    drawRoad([
      vec2(3417.566, 671.851), vec2(3415.443, 522.226), vec2(3414.029, 371.895), vec2(3413.324, 287.614), vec2(2989.212, 280.185), vec2(2853.029, 277.002), vec2(2856.566, 470.134), vec2(2857.981, 672.109)
    ]);

    drawRoad([
      vec2(3032.514, 687.029), vec2(3029.331, 753.529), vec2(3028.623, 828.164), vec2(3027.916, 903.153), vec2(3027.208, 978.142), vec2(3026.501, 1053.131), vec2(3025.440, 1128.473), vec2(3026.505, 1169.882), vec2(2600.271, 1163.515), vec2(2605.931, 896.809), vec2(2610.881, 689.988)
    ]);

    drawRoad([
      vec2(2317.999, 796.812), vec2(2321.183, 526.215), vec2(2320.829, 495.088), vec2(2756.260, 509.590), vec2(2905.884, 516.311), vec2(2923.570, 725.007), vec2(2581.875, 804.240)
    ]);

    drawRoad([
      vec2(2805.442, 522.864), vec2(2864.160, 470.514), vec2(2888.566, 537.013)
    ]);

    drawRoad([
      vec2(1869.849, 591.886), vec2(1881.875, 335.438), vec2(1935.995, 334.377), vec2(1940.239, 574.200), vec2(1944.130, 735.497), vec2(1868.787, 738.327)
    ]);

    drawRoad([
      vec2(1578.878, 600.747), vec2(1535.371, 744.358), vec2(1944.273, 739.052), vec2(1938.967, 607.114)
    ]);

    drawRoad([
      vec2(1830.020, 605.699), vec2(1874.943, 569.265), vec2(1891.214, 624.800)
    ]);

    drawRoad([
      vec2(4314.999, 2968.162), vec2(4316.414, 2755.222), vec2(4316.414, 2545.111), vec2(4316.414, 2340.660), vec2(4313.230, 2201.294), vec2(4617.431, 2201.648), vec2(4863.621, 2200.940), vec2(5164.638, 2211.198), vec2(5135.279, 2352.333), vec2(5100.614, 2505.141), vec2(5096.723, 2533.792), vec2(5033.053, 2631.773), vec2(4969.123, 2729.611), vec2(4905.298, 2826.579), vec2(4841.275, 2923.853), vec2(4777.251, 3021.126), vec2(4723.839, 3109.910), vec2(4591.901, 3322.143), vec2(4548.393, 3395.010)
    ]);

    drawRoad([
      vec2(5192.520, 2067.140), vec2(5154.318, 2252.490), vec2(4787.509, 2256.734), vec2(4670.621, 2221.714), vec2(4681.232, 2196.246)
    ]);

    drawRoad([
      vec2(4328.094, 2961.598), vec2(4272.913, 3029.866), vec2(4341.889, 3065.946), vec2(4464.984, 3012.534)
    ]);

    drawRoad([
      vec2(4289.442, 3018.386), vec2(4247.703, 3018.033), vec2(4141.667, 3018.387), vec2(4035.551, 3018.741), vec2(3667.327, 3017.680), vec2(3306.884, 3016.619), vec2(3302.640, 3246.891), vec2(3299.810, 3328.955), vec2(3743.377, 3327.540), vec2(4182.345, 3326.478), vec2(4539.250, 3327.186)
    ]);

    drawRoad([
      vec2(3716.140, 3316.574), vec2(3798.383, 3393.321), vec2(3833.755, 3277.301)
    ]);

    drawRoad([
      vec2(3765.133, 3315.149), vec2(3765.841, 3431.877), vec2(3765.486, 3549.576), vec2(3765.133, 3667.365), vec2(3764.779, 3785.155), vec2(3764.779, 3921.691), vec2(3922.539, 3838.213), vec2(4076.054, 3745.891), vec2(4215.420, 3648.264), vec2(4350.542, 3547.454), vec2(4484.248, 3444.874), vec2(4547.918, 3394.292), vec2(4572.679, 3309.753), vec2(4266.710, 3285.346)
    ]);

    drawRoad([
      vec2(4199.945, 2570.530), vec2(4061.355, 2571.299), vec2(3922.696, 2570.237), vec2(3783.330, 2569.884), vec2(3643.964, 2569.530), vec2(3501.060, 2569.884), vec2(3357.803, 2569.884), vec2(3214.546, 2569.884), vec2(3071.289, 2569.884), vec2(2929.447, 2570.591), vec2(2927.324, 2806.523), vec2(3245.674, 2906.980), vec2(3490.883, 2906.429), vec2(3736.720, 2906.075), vec2(3982.556, 2905.721), vec2(4201.863, 2906.429)
    ]);

    drawRoad([
      vec2(2228.878, 2678.339), vec2(2229.585, 2871.117), vec2(2231.354, 3061.773), vec2(2235.245, 3250.661), vec2(2233.476, 3303.719), vec2(2584.014, 3310.439), vec2(2933.736, 3318.566), vec2(3189.420, 3326.347), vec2(3191.542, 3143.826), vec2(3194.018, 2962.367), vec2(3196.494, 2782.677), vec2(2838.175, 2679.036)
    ]);

    drawRoad([
      vec2(2888.049, 2633.760), vec2(2824.026, 2691.770), vec2(2890.185, 2722.953)
    ]);

    drawRoad([
      vec2(3125.056, 2583.940), vec2(3056.080, 2508.951), vec2(3041.931, 2577.219)
    ]);

    drawRoad([
      vec2(3259.116, 2891.324), vec2(3183.420, 2944.028), vec2(3177.760, 2869.040)
    ]);

    drawRoad([
      vec2(1469.286, 3004.869), vec2(1468.224, 3072.783), vec2(1924.879, 3072.783), vec2(2120.133, 3073.491), vec2(2121.194, 3004.515)
    ]);

    drawRoad([
      vec2(2023.954, 3761.497), vec2(2025.369, 3627.790), vec2(2025.015, 3491.608), vec2(2024.662, 3355.425), vec2(2025.015, 3219.242), vec2(2025.369, 3083.059), vec2(2026.076, 3006.655), vec2(2120.166, 3005.241), vec2(2121.453, 3098.979), vec2(2121.453, 3193.422), vec2(2121.453, 3287.374), vec2(2121.453, 3381.366), vec2(2121.453, 3475.338), vec2(2121.453, 3569.290), vec2(2119.684, 3668.214), vec2(2118.623, 3763.365)
    ]);

    drawRoad([
      vec2(2530.708, 3422.024), vec2(2099.522, 3411.412), vec2(2090.679, 3578.722), vec2(2084.666, 3762.657), vec2(2530.001, 3761.950)
    ]);

    drawRoad([
      vec2(2109.072, 3364.013), vec2(2171.681, 3429.452), vec2(2099.522, 3435.111)
    ]);

    drawRoad([
      vec2(1975.795, 3054.715), vec2(2032.744, 3119.446), vec2(2062.994, 3060.487)
    ]);

    drawRoad([
      vec2(1356.612, 3004.952), vec2(980.752, 3006.786), vec2(987.158, 3247.316), vec2(1265.183, 3451.414), vec2(1317.180, 3230.692), vec2(1355.028, 3208.053)
    ]);

    drawRoad([
      vec2(1912.445, 3183.631), vec2(1531.487, 3185.046), vec2(1195.097, 3184.339), vec2(1248.863, 3436.896), vec2(1444.471, 3576.969), vec2(1644.324, 3709.261), vec2(1839.585, 3829.297), vec2(1908.915, 3871.036), vec2(1912.098, 3821.515), vec2(1911.744, 3710.093), vec2(1911.038, 3595.113), vec2(1910.331, 3479.800)
    ]);

    drawRoad([
      vec2(1394.983, 3195.852), vec2(1341.217, 3125.461), vec2(1329.898, 3225.211)
    ]);

    drawRoad([
      vec2(1135.235, 1562.712), vec2(1204.564, 1463.316), vec2(1226.849, 1651.142), vec2(1245.950, 1821.636), vec2(1264.971, 1991.421), vec2(1283.993, 2161.206), vec2(1303.014, 2330.990), vec2(1322.034, 2500.755), vec2(1341.055, 2670.540), vec2(1360.077, 2840.324), vec2(1370.960, 2896.544), vec2(1137.151, 2894.776), vec2(1137.504, 2679.359), vec2(1139.273, 2463.589), vec2(1141.041, 2247.819), vec2(1139.273, 2055.395), vec2(1138.919, 1863.678)
    ]);

    drawRoad([
      vec2(1418.274, 1926.038), vec2(1224.788, 1797.283), vec2(1198.259, 1967.423), vec2(1188.001, 2133.672), vec2(1194.015, 2283.650), vec2(1427.117, 2288.956)
    ]);

    drawRoad([
      vec2(1391.745, 2323.267), vec2(1410.138, 2267.379), vec2(1479.468, 2365.714)
    ]);

    drawRoad([
      vec2(2117.520, 2327.631), vec2(1667.233, 2328.338), vec2(1348.176, 2328.692), vec2(1341.809, 2548.706), vec2(1343.224, 2742.192), vec2(1349.944, 2895.000), vec2(1591.890, 2896.061), vec2(1834.543, 2896.061), vec2(2119.289, 2895.353), vec2(2118.935, 2638.198)
    ]);

    drawRoad([
      vec2(2763.063, 2570.026), vec2(2765.539, 2302.966), vec2(2768.722, 2142.376), vec2(2366.541, 2142.376), vec2(2234.697, 2146.621), vec2(2226.915, 2271.838), vec2(2229.745, 2409.790), vec2(2231.160, 2567.196)
    ]);

    drawRoad([
      vec2(2105.670, 1737.137), vec2(2105.317, 2004.197), vec2(2110.976, 2219.259), vec2(2449.488, 2215.722), vec2(2460.453, 2090.505), vec2(2461.514, 1906.923), vec2(2460.807, 1741.028)
    ]);

    drawRoad([
      vec2(2060.919, 1950.673), vec2(1771.575, 1951.734), vec2(1532.459, 1951.380), vec2(1537.411, 2203.937), vec2(1534.228, 2218.793), vec2(1829.585, 2216.671), vec2(2117.868, 2215.964), vec2(2185.075, 2086.855)
    ]);

    drawRoad([
      vec2(2052.314, 1961.152), vec2(2130.133, 1908.801), vec2(2122.351, 2013.856)
    ]);

    drawRoad([
      vec2(2275.437, 2171.329), vec2(2179.932, 2208.470), vec2(2258.105, 2275.323)
    ]);

    drawRoad([
      vec2(2448.840, 2097.167), vec2(2512.510, 2163.313), vec2(2425.141, 2178.876)
    ]);

    drawRoad([
      vec2(5352.273, 3781.865), vec2(5271.271, 3783.634), vec2(5189.915, 3783.987), vec2(5103.961, 3784.341), vec2(4626.791, 3787.525), vec2(4478.935, 3788.586), vec2(4273.777, 3941.040), vec2(4042.796, 4084.297), vec2(3840.821, 4190.413), vec2(3885.037, 4370.695), vec2(4288.279, 4231.329), vec2(5093.703, 4048.809), vec2(5389.060, 4037.843)
    ]);

    drawRoad([
      vec2(2640.684, 3423.711), vec2(3051.194, 3435.402), vec2(3201.171, 3440.355), vec2(3200.051, 3601.296), vec2(3198.989, 3762.239), vec2(3197.928, 3923.182), vec2(3196.513, 4108.886), vec2(3003.028, 4138.599), vec2(2800.699, 4158.761), vec2(2704.841, 4165.835), vec2(2667.346, 3971.697), vec2(2642.232, 3817.121)
    ]);

    drawRoad([
      vec2(3179.040, 3440.611), vec2(3646.306, 3440.257), vec2(3654.537, 3439.551), vec2(3652.594, 3577.923), vec2(3652.241, 3715.167), vec2(3652.241, 3852.411), vec2(3652.948, 3970.908), vec2(3580.789, 4000.267), vec2(3499.787, 4028.211), vec2(3408.880, 4055.094), vec2(3298.166, 4081.269), vec2(3193.818, 4107.091), vec2(3097.959, 4124.423)
    ]);

    drawRoad([
      vec2(1964.989, 3870.805), vec2(1948.718, 3892.736), vec2(2039.625, 3942.257), vec2(2134.776, 3990.363), vec2(2235.233, 4037.054), vec2(2341.349, 4080.208), vec2(2450.649, 4119.117), vec2(2561.364, 4149.184), vec2(2672.786, 4165.455), vec2(2706.743, 4167.659), vec2(2766.896, 4085.596), vec2(2605.245, 3874.070)
    ]);

    drawRoad([
      vec2(2585.083, 3879.376), vec2(2656.889, 3838.698), vec2(2708.532, 3915.456), vec2(2666.670, 4009.545)
    ]);

    drawRoad([
      vec2(1984.433, 3886.868), vec2(1863.107, 3820.368), vec2(1840.115, 3833.102), vec2(1977.359, 3910.213)
    ]);

    drawRoad([
      vec2(658.275, 3339.002), vec2(345.232, 3070.528), vec2(241.238, 3111.913), vec2(545.792, 3359.518), vec2(657.634, 3446.720)
    ]);

    drawRoad([
      vec2(570.564, 3379.980), vec2(652.627, 3327.629), vec2(1005.641, 3599.641), vec2(1003.165, 3688.425)
    ]);

    drawRoad([
      vec2(964.963, 3653.406), vec2(1002.458, 3595.750), vec2(1391.198, 3870.238), vec2(1415.239, 3947.548)
    ]);

    drawRoad([
      vec2(1345.910, 3895.551), vec2(1375.269, 3861.948), vec2(1782.048, 4110.968), vec2(1745.969, 4143.864)
    ]);

    drawRoad([
      vec2(4779.037, 3565.911), vec2(4623.399, 3679.102), vec2(5000.715, 3675.834), vec2(5285.815, 3675.834), vec2(5420.583, 3516.659)
    ]);

    drawRoad([
      vec2(5835.035, 1405.523), vec2(5642.610, 1404.108), vec2(5535.849, 1642.168), vec2(5511.796, 1763.494), vec2(5490.572, 1925.145), vec2(5465.812, 2086.796), vec2(5439.637, 2247.739), vec2(5846.062, 2245.263), vec2(5845.709, 2027.371), vec2(5840.403, 1809.125)
    ]);

    drawRoad([
      vec2(5442.420, 2229.989), vec2(5384.763, 2496.341), vec2(5331.351, 2747.130), vec2(5651.115, 2666.128), vec2(5851.676, 2667.543), vec2(5848.634, 2438.681), vec2(5845.451, 2219.020)
    ]);

    drawRoad([
      vec2(4799.781, 819.342), vec2(4955.418, 820.756), vec2(5038.543, 1067.300), vec2(5119.899, 1315.259), vec2(5194.887, 1566.755), vec2(5240.164, 1745.738), vec2(4801.195, 1644.220), vec2(4801.067, 1476.690), vec2(4800.364, 1309.658), vec2(4800.717, 1141.640)
    ]);

    drawRoad([
      vec2(4008.381, 1613.504), vec2(4395.706, 1613.504), vec2(4783.031, 1613.504), vec2(5234.026, 1717.852), vec2(5240.393, 1754.993), vec2(5214.218, 1946.356), vec2(5014.719, 1998.353), vec2(4815.220, 2050.704), vec2(4660.997, 2089.967), vec2(4459.446, 2086.940), vec2(4253.226, 2085.171), vec2(4012.696, 2082.341)
    ]);

    drawRoad([
      vec2(4282.374, 810.128), vec2(4282.020, 1037.571), vec2(4281.666, 1266.782), vec2(4280.959, 1502.361), vec2(4689.153, 1502.714), vec2(4689.192, 1229.641), vec2(4689.546, 967.180), vec2(4689.900, 817.556)
    ]);

    drawRoad([
      vec2(4284.774, 1500.441), vec2(3908.768, 1503.270), vec2(3592.477, 1507.861), vec2(3587.812, 1280.763), vec2(4006.618, 1277.579), vec2(4328.151, 1276.164), vec2(4338.763, 1502.546)
    ]);

    drawRoad([
      vec2(3897.919, 2081.767), vec2(3897.212, 1847.957), vec2(3896.506, 1614.598), vec2(3894.031, 1461.907), vec2(3592.307, 1469.335), vec2(3596.552, 1645.489), vec2(3600.796, 1821.642), vec2(3605.041, 1997.795), vec2(3605.395, 2076.675)
    ]);

    drawRoad([
      vec2(2715.206, 1287.181), vec2(2276.945, 1257.114), vec2(2241.573, 1292.487), vec2(2516.799, 1339.147), vec2(2798.361, 1345.160)
    ]);

    drawRoad([
      vec2(3475.878, 1283.203), vec2(3021.346, 1280.727), vec2(2594.404, 1283.203), vec2(2241.037, 1291.339), vec2(2107.330, 1429.290), vec2(2106.315, 1626.961), vec2(2561.555, 1631.206), vec2(3008.305, 1632.975), vec2(3432.417, 1632.267), vec2(3480.523, 1635.097)
    ]);

    drawRoad([
      vec2(2569.910, 2033.471), vec2(2569.910, 1745.188), vec2(2564.958, 1582.123), vec2(2948.392, 1580.000), vec2(3321.115, 1577.525), vec2(3481.351, 1580.355), vec2(3483.827, 1757.215), vec2(3487.364, 1935.491), vec2(3489.133, 2028.520), vec2(3055.470, 2033.118)
    ]);

    drawRoad([
      vec2(3101.471, 592.241), vec2(3087.676, 658.033), vec2(3009.615, 718.695), vec2(2943.115, 667.759)
    ]);

    drawRoad([
      vec2(2556.466, 789.333), vec2(2626.149, 849.819), vec2(2675.207, 746.484)
    ]);

    drawRoad([
      vec2(2204.812, 713.572), vec2(1889.646, 705.790), vec2(1551.488, 696.239), vec2(1472.962, 949.504), vec2(1487.819, 962.238), vec2(1820.317, 967.897), vec2(2199.860, 979.216)
    ]);

    drawRoad([
      vec2(2494.510, 912.009), vec2(2133.714, 905.289), vec2(2156.706, 979.570), vec2(2490.717, 991.126)
    ]);

    drawRoad([
      vec2(2279.546, 1146.763), vec2(2275.655, 907.648), vec2(2492.486, 913.307), vec2(2488.949, 1155.960)
    ]);

    drawRoad([
      vec2(2285.205, 1021.900), vec2(2162.818, 912.600), vec2(2180.504, 859.895), vec2(2289.804, 939.483)
    ]);

    drawRoad([
      vec2(3191.664, 2459.856), vec2(3192.371, 2220.386), vec2(3192.724, 1992.179), vec2(3491.265, 1994.302), vec2(3493.034, 2242.260), vec2(3493.739, 2460.243)
    ]);

    drawRoad([
      vec2(4196.584, 2194.598), vec2(3991.706, 2193.554), vec2(3785.487, 2191.431), vec2(3580.129, 2189.318), vec2(3373.909, 2187.195), vec2(3401.853, 2427.726), vec2(3452.081, 2459.915), vec2(3750.976, 2458.854), vec2(4049.270, 2457.795), vec2(4196.772, 2458.502)
    ]);

    drawRoad([
      vec2(3548.326, 2196.798), vec2(3475.106, 2143.386), vec2(3410.729, 2176.282), vec2(3452.468, 2223.681)
    ]);

    drawRoad([
      vec2(3112.188, 2017.461), vec2(3218.658, 2068.043), vec2(3228.916, 1957.328)
    ]);

    drawRoad([
      vec2(1924.870, 650.957), vec2(1999.859, 733.021), vec2(1927.346, 752.122)
    ]);

    drawRoad([
      vec2(1962.461, 1088.083), vec2(2163.946, 1090.916), vec2(2166.776, 1206.229), vec2(1976.120, 1393.702)
    ]);

    drawRoad([
      vec2(900.501, 1122.033), vec2(991.421, 1258.077), vec2(941.281, 1301.197), vec2(845.682, 1197.241)
    ]);

    drawRoad([
      vec2(1153.203, 1327.938), vec2(1105.070, 1397.799), vec2(945.292, 1281.141), vec2(986.072, 1240.027)
    ]);

    drawRoad([
      vec2(1153.203, 1327.938), vec2(1105.070, 1397.799), vec2(945.292, 1281.141), vec2(986.072, 1240.027)
    ]);

    drawRoad([
      vec2(302.173, 1622.423), vec2(159.109, 1706.992), vec2(2.674, 1789.554), vec2(4.680, 1555.905), vec2(4.680, 1320.919), vec2(5.348, 1087.270), vec2(5.348, 854.958), vec2(5.348, 638.022), vec2(264.735, 631.671), vec2(302.173, 859.304), vec2(302.173, 1073.565), vec2(302.173, 1287.827)
    ]);

    drawRoad([
      vec2(259.387, 865.956), vec2(432.535, 716.541), vec2(241.337, 665.398)
    ]);

    drawRoad([
      vec2(871.755, 748.630), vec2(396.435, 754.981), vec2(292.145, 749.967), vec2(153.092, 596.541), vec2(838.329, 575.482)
    ]);

    drawRoad([
      vec2(916.535, 1266.647), vec2(770.796, 1012.274), vec2(568.234, 1017.288), vec2(567.565, 1268.987), vec2(568.234, 1481.912)
    ]);

    drawRoad([
      vec2(558.886, 1451.189), vec2(569.582, 1440.159), vec2(572.925, 1616.983), vec2(573.593, 1797.150), vec2(570.251, 1967.958), vec2(815.599, 1825.228), vec2(822.284, 1617.652), vec2(719.331, 1379.992)
    ]);

    drawRoad([
      vec2(301.504, 1618.654), vec2(300.836, 1762.053), vec2(294.819, 1914.142), vec2(296.156, 2046.175), vec2(177.827, 2096.081), vec2(177.827, 1886.499), vec2(177.159, 1684.939), vec2(185.850, 1576.304)
    ]);

    drawRoad([
      vec2(1202.298, 1274.061), vec2(1109.209, 1239.685), vec2(1022.643, 1180.720), vec2(939.590, 1056.517), vec2(953.893, 1029.670), vec2(1220.615, 1242.696)
    ]);

    drawRoad([
      vec2(1200.061, 1276.267), vec2(1342.655, 1021.204), vec2(1326.875, 1011.163), vec2(1183.707, 1260.487)
    ]);

    drawRoad([
      vec2(1319.931, 1024.277), vec2(1336.285, 1031.450), vec2(1448.467, 763.763), vec2(1429.244, 758.886)
    ]);

    drawRoad([
      vec2(1425.227, 772.657), vec2(1440.433, 779.830), vec2(1500.971, 593.626), vec2(1476.584, 589.896)
    ]);

    drawRoad([
      vec2(1477.732, 595.634), vec2(1500.397, 599.364), vec2(1515.604, 466.525), vec2(1488.347, 468.533)
    ]);

    drawRoad([
      vec2(947.436, 1044.849), vec2(1053.306, 833.397), vec2(1059.331, 836.553), vec2(959.199, 1053.170)
    ]);

    drawRoad([
      vec2(1015.042, 862.766), vec2(1041.151, 867.643), vec2(1064.390, 818.008), vec2(1033.691, 813.130)
    ]);
    //#endregion DRAW ROAD

    //#region DRAW HOLES
    drawHole(vec2(5322.205, 1217.711));
    drawHole(vec2(5031.800, 855.854));
    drawHole(vec2(4196.007, 1528.278));
    drawHole(vec2(4322.367, 2176.517));
    drawHole(vec2(2204.545, 3851.871));
    drawHole(vec2(513.249, 2102.367));
    drawHole(vec2(352.660, 2230.768));
    drawHole(vec2(2169.013, 4225.361));
    drawHole(vec2(3681.377, 3814.999));
    drawHole(vec2(1057.842, 1526.349));
    drawHole(vec2(1739.463, 509.991));
    // drawHole();
    //#endregion DRAW HOLES

    //#region DRAW BIKE
    drawBike([
      vec2(2183.068, 621.631), vec2(2084.920, 620.806), vec2(2029.032, 620.098), vec2(2027.617, 585.787), vec2(2027.979, 536.099), vec2(2028.333, 486.225), vec2(2026.918, 435.289), vec2(2026.564, 384.353), vec2(2026.210, 333.417), vec2(2024.795, 283.542), vec2(2018.782, 261.612), vec2(1995.083, 247.008), vec2(1958.649, 245.239), vec2(1915.495, 246.300), vec2(1872.125, 246.300), vec2(1829.777, 247.715), vec2(1800.894, 250.191), vec2(1793.820, 278.135), vec2(1792.405, 305.018), vec2(1792.405, 335.438), vec2(1792.405, 365.858), vec2(1792.405, 396.278), vec2(1791.344, 426.698), vec2(1787.453, 459.948), vec2(1782.500, 496.735), vec2(1774.365, 528.924), vec2(1763.046, 561.466), vec2(1729.181, 565.445), vec2(1695.931, 544.222), vec2(1674.708, 522.291), vec2(1647.471, 504.605), vec2(1605.378, 505.312), vec2(1561.871, 509.557), vec2(1537.464, 516.631), vec2(1529.328, 549.881), vec2(1521.560, 584.137), vec2(1512.717, 618.801), vec2(1503.874, 653.466), vec2(1495.031, 688.131), vec2(1486.188, 722.796), vec2(1477.345, 757.460), vec2(1458.598, 791.771), vec2(1439.850, 826.082), vec2(1421.457, 860.393), vec2(1406.601, 895.412), vec2(1393.159, 930.076), vec2(1392.098, 976.060), vec2(1408.723, 1014.262), vec2(1435.606, 1044.328), vec2(1463.903, 1056.001), vec2(1522.267, 1057.416), vec2(1585.584, 1058.123), vec2(1649.253, 1058.831), vec2(1712.923, 1059.538), vec2(1776.593, 1060.246), vec2(1840.263, 1060.953), vec2(1904.287, 1061.661), vec2(1968.310, 1062.368), vec2(2032.334, 1063.076), vec2(2096.357, 1063.783), vec2(2157.197, 1066.259), vec2(2182.312, 1068.028), vec2(2186.556, 1097.740), vec2(2187.618, 1128.868), vec2(2187.971, 1158.934), vec2(2190.801, 1189.708), vec2(2220.160, 1214.468), vec2(2253.410, 1236.045), vec2(2291.965, 1240.644), vec2(2341.486, 1244.181), vec2(2393.130, 1246.657), vec2(2444.321, 1249.465), vec2(2495.099, 1252.267), vec2(2546.272, 1255.090), vec2(2570.561, 1221.480), vec2(2582.234, 1181.156), vec2(2585.417, 1141.539), vec2(2586.832, 1098.385), vec2(2586.107, 1056.475), vec2(2585.400, 1013.675), vec2(2585.046, 970.875), vec2(2585.400, 928.175), vec2(2584.692, 886.536), vec2(2583.631, 846.212), vec2(2556.041, 831.002), vec2(2504.044, 821.451), vec2(2430.116, 820.036), vec2(2354.066, 816.853), vec2(2288.274, 815.084), vec2(2293.579, 756.013), vec2(2296.056, 693.050), vec2(2296.056, 630.442)
    ]);

    drawBike([
      vec2(4099.910, 2108.102), vec2(4018.308, 2108.470), vec2(3976.215, 2103.165), vec2(3973.739, 2066.731), vec2(3976.215, 1991.742), vec2(3978.691, 1916.400), vec2(3980.106, 1838.581), vec2(3980.443, 1761.719), vec2(3980.438, 1685.178), vec2(3979.731, 1609.718), vec2(3986.805, 1582.127), vec2(4083.371, 1582.481), vec2(4182.060, 1581.774), vec2(4284.639, 1585.311), vec2(4386.724, 1587.075), vec2(4488.596, 1587.075), vec2(4590.468, 1587.075), vec2(4689.510, 1587.075), vec2(4756.717, 1583.184), vec2(4773.342, 1554.178), vec2(4778.294, 1500.413), vec2(4779.355, 1426.839), vec2(4779.001, 1353.265), vec2(4777.940, 1280.044), vec2(4776.879, 1206.824), vec2(4775.818, 1133.250), vec2(4775.464, 1058.968), vec2(4776.172, 982.918), vec2(4777.233, 906.868), vec2(4778.294, 830.818), vec2(4778.648, 789.786), vec2(4772.634, 750.170), vec2(4725.943, 722.579), vec2(4633.622, 721.872), vec2(4541.301, 721.518), vec2(4448.979, 721.164), vec2(4356.658, 720.811), vec2(4264.337, 720.457), vec2(4203.850, 726.824), vec2(4192.177, 760.428), vec2(4192.885, 819.853), vec2(4189.701, 881.754), vec2(4186.872, 944.009), vec2(4190.409, 1011.216), vec2(4192.177, 1079.131), vec2(4192.177, 1146.691), vec2(4192.531, 1187.016), vec2(4155.037, 1208.946), vec2(4099.784, 1192.304), vec2(4033.638, 1187.352), vec2(3966.077, 1188.766), vec2(3895.686, 1191.243), vec2(3824.942, 1190.181), vec2(3754.198, 1188.766), vec2(3683.807, 1189.120), vec2(3613.770, 1189.120), vec2(3541.611, 1189.828), vec2(3503.763, 1215.296), vec2(3498.811, 1269.415), vec2(3493.505, 1325.657), vec2(3491.029, 1385.082), vec2(3496.335, 1447.691), vec2(3499.165, 1512.068), vec2(3500.933, 1577.153), vec2(3502.702, 1642.237), vec2(3504.471, 1707.322), vec2(3506.239, 1772.407), vec2(3508.008, 1837.492), vec2(3509.776, 1902.576), vec2(3511.545, 1967.661), vec2(3513.314, 2032.746), vec2(3514.728, 2097.831), vec2(3530.646, 2153.011), vec2(3589.364, 2164.330), vec2(3686.283, 2167.867), vec2(3788.509, 2171.051), vec2(3891.442, 2173.881), vec2(3993.924, 2174.576), vec2(4090.054, 2176.341)
    ])

    drawBike([
      vec2(1597.794, 2914.785), vec2(1274.680, 2916.901), vec2(1113.387, 2921.484), vec2(1109.685, 2808.315), vec2(1110.567, 2570.694), vec2(1110.743, 2333.427), vec2(1110.567, 2097.217), vec2(1110.390, 1861.006), vec2(1110.214, 1625.145), vec2(1109.333, 1540.532), vec2(1218.800, 1382.942), vec2(1238.367, 1461.561), vec2(1261.107, 1674.150), vec2(1277.148, 1786.614), vec2(1408.826, 1877.220), vec2(1455.539, 1916.001), vec2(1454.305, 2034.458), vec2(1453.071, 2152.563), vec2(1459.241, 2271.021), vec2(1481.276, 2302.751), vec2(1689.810, 2303.103), vec2(1901.871, 2301.693), vec2(2102.297, 2301.693), vec2(2148.305, 2299.930), vec2(2149.891, 2381.370), vec2(2147.247, 2575.979), vec2(2147.434, 2623.873), vec2(2245.972, 2654.545), vec2(2484.826, 2652.429), vec2(2722.623, 2652.429), vec2(2816.225, 2644.321), vec2(2843.901, 2620.700), vec2(2846.192, 2383.079), vec2(2846.369, 2150.747), vec2(2848.308, 2062.962), vec2(2559.744, 2063.314), vec2(2536.651, 2051.680), vec2(2538.238, 1842.969), vec2(2544.406, 1709.519), vec2(2529.423, 1673.559), vec2(2459.794, 1658.751), vec2(2171.582, 1657.341), vec2(2054.711, 1655.578), vec2(2027.388, 1704.583), vec2(2028.270, 1815.990), vec2(2018.574, 1866.052), vec2(1960.580, 1887.558), vec2(1888.835, 1906.596), vec2(1808.982, 1921.403), vec2(1721.725, 1922.460), vec2(1641.520, 1910.121), vec2(1582.820, 1891.436), vec2(1517.421, 1872.046), vec2(1475.644, 1888.615), vec2(1455.020, 1964.767), vec2(1450.613, 2106.845), vec2(1452.904, 2243.636), vec2(1493.624, 2298.986), vec2(1782.893, 2308.858), vec2(2066.169, 2301.454), vec2(2140.381, 2299.691), vec2(2141.968, 2413.213), vec2(2149.548, 2579.265), vec2(2147.241, 2733.711), vec2(2144.245, 2887.777), vec2(2144.068, 2924.442), vec2(2063.157, 2918.096), vec2(1940.998, 2923.737),
    ])

    drawBike([
      vec2(3560.698, 3336.737), vec2(3557.701, 3349.781), vec2(3490.906, 3350.453), vec2(3419.514, 3350.806), vec2(3309.694, 3356.094), vec2(3269.327, 3352.921), vec2(3169.731, 3350.453), vec2(2922.063, 3343.402), vec2(2671.927, 3335.293), vec2(2605.118, 3342.697), vec2(2552.764, 3356.447), vec2(2549.415, 3382.183), vec2(2547.476, 3410.387), vec2(2549.767, 3529.197), vec2(2552.627, 3540.988), vec2(2552.450, 3670.023), vec2(2560.030, 3758.513), vec2(2563.379, 3790.595), vec2(2542.755, 3804.698), vec2(2479.472, 3793.416), vec2(2239.560, 3782.487), vec2(2035.609, 3781.429), vec2(2023.446, 3789.538), vec2(1995.418, 3790.243), vec2(1994.536, 3665.792), vec2(1997.180, 3508.201), vec2(1996.299, 3331.925), vec2(1998.238, 3167.988), vec2(1991.354, 3120.090), vec2(1947.462, 3094.706), vec2(1810.142, 3098.584), vec2(1654.843, 3103.520), vec2(1497.491, 3102.096), vec2(1461.707, 3110.910), vec2(1424.160, 3109.147), vec2(1431.740, 3036.874), vec2(1429.096, 2990.690), vec2(1451.835, 2958.255), vec2(1572.799, 2975.374), vec2(1715.054, 2971.849), vec2(1869.523, 2974.320), vec2(2023.412, 2973.615), vec2(2116.662, 2966.916), vec2(2154.562, 2967.974), vec2(2184.705, 2990.185), vec2(2148.568, 3040.247), vec2(2152.270, 3108.290), vec2(2152.799, 3308.539), vec2(2152.270, 3360.717), vec2(2191.932, 3389.979), vec2(2329.604, 3395.620), vec2(2472.211, 3401.261), vec2(2656.773, 3404.786), vec2(2842.744, 3409.369), vec2(3028.715, 3413.952), vec2(3214.687, 3418.536), vec2(3400.658, 3423.119), vec2(3533.074, 3422.834)
    ])

    drawBike([
      vec2(1190.776, 1293.023), vec2(1118.326, 1265.877), vec2(1053.985, 1229.564), vec2(994.580, 1186.905), vec2(952.450, 1123.093), vec2(925.480, 1044.474), vec2(914.022, 966.207), vec2(935.704, 912.619), vec2(915.785, 905.568), vec2(901.154, 937.651), vec2(897.452, 1009.219), vec2(915.608, 1086.780), vec2(949.982, 1157.643), vec2(1001.984, 1217.577), vec2(1065.619, 1262.351), vec2(1140.328, 1294.327)
    ])

    drawBike([
      vec2(1190.776, 1293.023), vec2(1118.326, 1265.877), vec2(1053.985, 1229.564), vec2(994.580, 1186.905), vec2(952.450, 1123.093), vec2(925.480, 1044.474), vec2(914.022, 966.207), vec2(935.704, 912.619), vec2(915.785, 905.568), vec2(901.154, 937.651), vec2(897.452, 1009.219), vec2(915.608, 1086.780), vec2(949.982, 1157.643), vec2(1001.984, 1217.577), vec2(1065.619, 1262.351), vec2(1140.328, 1294.327)
    ])

    drawBike([
      vec2(914.022, 966.207), vec2(935.704, 912.619), vec2(915.785, 905.568), vec2(901.154, 937.651), vec2(897.452, 1009.219), vec2(915.608, 1086.780), vec2(949.982, 1157.643), vec2(1001.984, 1217.577), vec2(1065.619, 1262.351), vec2(1140.328, 1294.327), vec2(1190.776, 1293.023), vec2(1118.326, 1265.877), vec2(1053.985, 1229.564), vec2(994.580, 1186.905), vec2(952.450, 1123.093), vec2(925.480, 1044.474),
    ])

    drawBike([
      vec2(897.452, 1009.219), vec2(915.608, 1086.780), vec2(949.982, 1157.643), vec2(1001.984, 1217.577), vec2(1065.619, 1262.351), vec2(1140.328, 1294.327), vec2(1190.776, 1293.023), vec2(1118.326, 1265.877), vec2(1053.985, 1229.564), vec2(994.580, 1186.905), vec2(952.450, 1123.093), vec2(925.480, 1044.474), vec2(914.022, 966.207), vec2(935.704, 912.619), vec2(915.785, 905.568), vec2(901.154, 937.651),
    ])

    drawBike([
      vec2(5945.118, 2353.121), vec2(5938.376, 2094.244), vec2(5933.432, 1851.997), vec2(5931.635, 1604.806), vec2(5929.837, 1371.997), vec2(5915.455, 1335.592), vec2(5879.500, 1308.177), vec2(5540.623, 1308.626), vec2(5139.724, 1306.379), vec2(5139.275, 1347.278), vec2(5186.466, 1500.087), vec2(5232.309, 1658.289), vec2(5251.185, 1751.323), vec2(5238.601, 1887.952), vec2(5226.466, 1949.076), vec2(5037.253, 1999.413), vec2(4822.871, 2059.188), vec2(4664.219, 2101.885), vec2(4462.421, 2101.885), vec2(4307.365, 2099.637), vec2(4245.342, 2116.716), vec2(4215.680, 2157.166), vec2(4219.724, 2323.907), vec2(4215.230, 2537.390), vec2(4213.882, 2726.154), vec2(4214.331, 2908.626), vec2(4209.387, 2924.357), vec2(4036.354, 2918.514), vec2(3822.421, 2918.064), vec2(3597.253, 2918.963), vec2(3370.736, 2920.312), vec2(3255.230, 2923.907), vec2(3229.612, 2936.042), vec2(3213.432, 2989.076), vec2(3207.271, 3138.761), vec2(3205.023, 3283.929), vec2(3200.978, 3361.682), vec2(3202.776, 3418.761), vec2(3471.990, 3420.558), vec2(3650.866, 3418.761), vec2(3671.540, 3422.356), vec2(3672.889, 3511.345), vec2(3669.743, 3675.839), vec2(3670.641, 3769.322), vec2(3702.552, 3775.614), vec2(3712.889, 3797.187), vec2(3716.035, 3830.895), vec2(3692.214, 3852.019), vec2(3670.641, 3865.952), vec2(3671.540, 3963.030), vec2(3894.462, 4165.277), vec2(4087.271, 4051.438), vec2(4285.922, 3930.989), vec2(4453.563, 3800.202), vec2(4498.057, 3766.045), vec2(4696.709, 3768.292), vec2(4941.653, 3773.685), vec2(5193.338, 3767.393), vec2(5304.349, 3766.045), vec2(5350.192, 3739.528), vec2(5462.102, 3610.989), vec2(5579.405, 3477.955), vec2(5741.653, 3281.551), vec2(5897.158, 3091.888), vec2(5942.552, 3048.742), vec2(5951.540, 2998.854), vec2(5949.293, 2806.944), vec2(5949.743, 2608.742)
    ])
    //#endregion DRAW BIKE

    //#region DRAW VEHICLES
    // TOP TO BOTTOM
    drawVehicle([
      vec2(4556.272, -27.305), vec2(4648.883, 62.480), vec2(4721.871, 168.618), vec2(4796.644, 289.324), vec2(4857.811, 406.395), vec2(4916.826, 529.777), vec2(4970.193, 656.132), vec2(5017.910, 786.649), vec2(5061.763, 918.653), vec2(5105.616, 1050.657), vec2(5149.468, 1182.661), vec2(5193.321, 1314.664), vec2(5233.308, 1447.263), vec2(5271.809, 1581.050), vec2(5303.175, 1716.919), vec2(5292.918, 1854.274), vec2(5276.120, 1991.035), vec2(5250.998, 2130.174), vec2(5225.578, 2269.313), vec2(5200.159, 2408.452), vec2(5160.766, 2546.104), vec2(5086.885, 2679.297), vec2(5001.410, 2811.598), vec2(4913.556, 2944.197), vec2(4825.220, 3076.177), vec2(4737.366, 3209.667), vec2(4652.485, 3344.941), vec2(4607.964, 3427.654), vec2(4492.163, 3522.495), vec2(4376.066, 3617.038), vec2(4254.022, 3708.906), vec2(4123.950, 3793.043), vec2(3991.203, 3875.694), vec2(3855.483, 3956.264), vec2(3713.817, 4021.374), vec2(3564.421, 4083.808), vec2(3395.106, 4131.674), vec2(3224.049, 4177.492), vec2(3046.706, 4197.082), vec2(2840.822, 4215.812), vec2(2663.479, 4226.812), vec2(2486.731, 4192.919), vec2(2326.037, 4131.972), vec2(2152.262, 4067.159), vec2(1974.919, 3978.265), vec2(1796.387, 3887.289), vec2(1622.929, 3789.042), vec2(1457.181, 3677.255), vec2(1297.546, 3558.743), vec2(1138.042, 3440.118), vec2(977.943, 3321.790), vec2(817.843, 3203.463), vec2(665.772, 3080.676), vec2(522.024, 2958.483), vec2(504.335, 2819.938), vec2(503.889, 2666.826), vec2(502.848, 2516.687), vec2(502.106, 2366.690), vec2(501.363, 2216.692), vec2(503.594, 2071.451), vec2(501.959, 1978.989), vec2(498.256, 1803.780)
    ]);

    // BOTTOM TO TOP
    drawVehicle([
      vec2(350.820, 1836.781), vec2(350.523, 1963.433), vec2(350.523, 2090.086), vec2(350.523, 2216.738), vec2(350.523, 2343.390), vec2(350.523, 2470.042), vec2(350.523, 2596.694), vec2(350.523, 2723.347), vec2(354.388, 2848.810), vec2(371.334, 2964.811), vec2(416.525, 3045.678), vec2(505.419, 3115.304), vec2(614.976, 3207.469), vec2(727.804, 3301.120), vec2(840.929, 3394.474), vec2(954.053, 3487.828), vec2(1078.773, 3576.723), vec2(1204.087, 3665.617), vec2(1329.402, 3754.214), vec2(1455.608, 3840.433), vec2(1584.787, 3917.732), vec2(1713.520, 3996.548), vec2(1842.699, 4074.145), vec2(1971.232, 4144.813), vec2(2100.114, 4203.679), vec2(2233.448, 4246.137), vec2(2383.438, 4299.057), vec2(2558.325, 4343.059), vec2(2744.885, 4354.059), vec2(2932.038, 4346.626), vec2(3099.273, 4327.301), vec2(3244.209, 4299.949), vec2(3383.497, 4266.354), vec2(3529.326, 4220.271), vec2(3746.507, 4148.026), vec2(3929.796, 4060.024), vec2(4096.733, 3964.589), vec2(4257.417, 3862.916), vec2(4408.895, 3759.156), vec2(4550.308, 3652.299), vec2(4682.758, 3542.891), vec2(4769.422, 3416.833), vec2(4849.546, 3288.397), vec2(4933.535, 3160.556), vec2(5016.334, 3032.417), vec2(5099.134, 2904.278), vec2(5181.934, 2776.139), vec2(5264.733, 2648.001), vec2(5316.316, 2503.807), vec2(5349.168, 2360.506), vec2(5378.155, 2216.015), vec2(5407.440, 2071.525), vec2(5430.184, 1927.034), vec2(5452.928, 1782.544), vec2(5420.076, 1643.107), vec2(5381.872, 1494.455), vec2(5338.911, 1346.694), vec2(5285.247, 1199.825), vec2(5234.557, 1048.199), vec2(5187.137, 894.789), vec2(5137.635, 741.974), vec2(5086.053, 589.753), vec2(5029.416, 440.803), vec2(4964.787, 298.078), vec2(4886.744, 152.101), vec2(4800.079, 44.047), vec2(4729.172, -22.251)
    ])
    //#endregion DRAW VEHICLES

    //#region DRAW KEBABS
    drawKebab(vec2(4897.682, 2120.561));
    drawKebab(vec2(4452.283, 2180.264));
    drawKebab(vec2(3707.700, 2930.507));
    drawKebab(vec2(3999.520, 1254.279));
    drawKebab(vec2(1738.965, 2979.088));
    drawKebab(vec2(1950.292, 993.678));
    drawKebab(vec2(3236.730, 696.941));
    drawKebab(vec2(2828.056, 2052.385));
    //#endregion DRAW KEBABS

    //#region DRAW PEOPLE

    const spawner = add([timer()])
    function spawnShoppingPeople(peopleSpawns: {door: Vec2, road: Vec2}[]) {
      drawShoppingPeople(peopleSpawns);
      spawner.wait(randi(5, 15), () => {
        spawnShoppingPeople(peopleSpawns);
      });
    }

    const peopleSpawns: {door: Vec2, road: Vec2}[] = [
      {door: vec2(1500.580, 1817.855), road: vec2(1500.580, 1869.131)},
      {door: vec2(1581.500, 1812.781), road: vec2(1583.903, 1868.330)},
      {door: vec2(1719.037, 1811.446), road: vec2(1721.974, 1865.125)},
      {door: vec2(1806.366, 1811.980), road: vec2(1809.571, 1864.858)},
      {door: vec2(1906.514, 1810.645), road: vec2(1909.986, 1864.858)},
    ];

    const peopleSpawns1 = [
      {door: vec2(3369.569, 146.959), road: vec2(3369.392, 202.662)},
      {door: vec2(3283.193, 138.850), road: vec2(3281.254, 199.489)},
      {door: vec2(3136.906, 141.318), road: vec2(3133.556, 200.194)},
      {door: vec2(3045.242, 142.023), road: vec2(3043.303, 200.547)},
      {door: vec2(2938.419, 143.433), road: vec2(2936.832, 197.374)}
    ]

    spawnShoppingPeople(peopleSpawns);
    spawnShoppingPeople(peopleSpawns);
    spawnShoppingPeople(peopleSpawns1);
    spawnShoppingPeople(peopleSpawns1);

    function spawnOldPeople(props: OldPeopleProps, reverse: boolean = false) {
      if (reverse && !props.reversedPath) {
        props.reversedPath = props.path.slice().reverse();
      }

      const o1 = drawOldPeople({
        path: reverse ? props.reversedPath : props.path,
        pauseAt: reverse ? props.goBackPauseAt : props.pauseAt
      });

      o1.onDestroy(() => {
        spawner.wait(randi(5, 15), () => {
          spawnOldPeople(props, reverse = !reverse);
        });
      })
    }
    spawnOldPeople({
      path: [vec2(1916.869, 2206.620), vec2(1917.768, 2241.676), vec2(1807.655, 2240.778), vec2(1696.760, 2242.127), vec2(1592.041, 2239.880), vec2(1537.210, 2232.689), vec2(1408.969, 2230.481), vec2(1408.149, 2154.077), vec2(1407.699, 2072.729), vec2(1406.351, 2005.313), vec2(1273.767, 2006.662), vec2(1271.520, 1971.156)],
      pauseAt: [vec2(1916.869, 2206.620), vec2(1537.210, 2232.689)],
      goBackPauseAt: [vec2(1271.520, 1971.156), vec2(1408.969, 2230.481)]
    });

    spawnOldPeople({
      path: [vec2(2638.779, 368.063), vec2(2639.678, 412.557), vec2(2638.330, 491.658), vec2(2365.072, 479.523), vec2(2303.049, 476.827), vec2(2300.352, 518.175), vec2(2307.094, 564.018), vec2(2310.689, 611.209), vec2(2301.251, 791.433), vec2(2307.993, 817.501), vec2(2255.409, 931.658), vec2(2262.600, 1017.051), vec2(2261.251, 1136.153), vec2(2402.375, 1146.040), vec2(2406.420, 1121.321)],
      pauseAt: [vec2(2638.779, 368.063), vec2(2301.251, 791.433)],
      goBackPauseAt: [vec2(2406.420, 1121.321), vec2(2255.409, 931.658)]
    });

    spawnOldPeople({
      path: [vec2(4250.778, 2064.867), vec2(4248.980, 2106.665), vec2(4439.991, 2108.912), vec2(4629.654, 2113.856), vec2(4725.834, 2107.114), vec2(4702.463, 2043.294)],
      pauseAt: [vec2(4250.778, 2064.867)],
      goBackPauseAt: [vec2(4702.463, 2043.294)]
    })

    spawnOldPeople({
      path: [vec2(1882.820, 2869.368), vec2(1881.022, 2910.717), vec2(1978.101, 2909.818), vec2(2076.079, 2911.615), vec2(2129.562, 2911.166), vec2(2129.562, 2881.503), vec2(2130.910, 2832.514), vec2(2132.708, 2750.267), vec2(2130.461, 2669.818), vec2(2130.910, 2602.851), vec2(2128.663, 2559.256), vec2(2247.315, 2557.009), vec2(2402.371, 2552.514)],
      pauseAt: [vec2(1882.820, 2869.368), vec2(2128.663, 2559.256)],
      goBackPauseAt: [vec2(2402.371, 2552.514), vec2(2247.315, 2557.009)]
    })

    spawnOldPeople({
      path: [vec2(4587.239, 1475.684), vec2(4586.790, 1522.425), vec2(4656.003, 1520.178), vec2(4693.307, 1516.583), vec2(4702.736, 1492.850), vec2(4700.039, 1446.558), vec2(4698.691, 1398.019), vec2(4698.691, 1348.131), vec2(4697.792, 1118.917), vec2(4699.590, 893.299), vec2(4702.286, 814.648), vec2(4645.657, 808.805), vec2(4420.488, 805.210), vec2(4277.567, 801.165), vec2(4163.859, 806.558), vec2(4164.309, 909.929), vec2(4163.410, 1024.985), vec2(4162.062, 1117.569), vec2(4151.275, 1148.131), vec2(3970.601, 1140.940)],
      pauseAt: [vec2(4587.239, 1475.684), vec2(4277.567, 801.165)],
      goBackPauseAt: [vec2(4163.859, 806.558), vec2(3970.601, 1140.940)]
    })
    //#endregion DRAW PEOPLE

    //#region DRAW SOUND TRIGGERS
    drawSoundTrigger([vec2(4617.688, 233.771), vec2(5089.318, 223.548), vec2(5148.324, 365.833), vec2(4709.335, 378.806)], "tutu_verstapen");

    drawSoundTrigger([vec2(4305.238, 993.398), vec2(4313.127, 1226.723), vec2(4312.520, 1428.493), vec2(4058.260, 1479.163), vec2(3734.821, 1634.814), vec2(3621.951, 1709.150), vec2(3388.323, 1704.599), vec2(3395.605, 1532.564), vec2(3398.032, 1362.349), vec2(3190.494, 1354.980), vec2(3191.101, 1105.877), vec2(3342.201, 942.337), vec2(3677.776, 950.530)], "jews");
    //#endregion DRAW SOUND TRIGGERS

    //#region DRAW JEWS
    const jewPath = [
      vec2(3811.081, 1140.970), vec2(3727.034, 1076.301), vec2(3753.182, 1148.908), vec2(3683.610, 1134.200), vec2(3624.310, 1077.935), vec2(3608.435, 1154.278), vec2(3558.474, 1148.908), vec2(3517.173, 1087.535), vec2(3472.348, 1137.262), vec2(3396.239, 1148.702), vec2(3398.107, 1191.426), vec2(3611.959, 1192.126), vec2(3612.893, 1299.286), vec2(3675.461, 1317.729), vec2(3634.838, 1368.391), vec2(3617.562, 1422.787), vec2(3672.192, 1473.449), vec2(3717.017, 1513.371), vec2(3632.503, 1588.780), vec2(3864.099, 1448.935), vec2(3799.261, 1424.665), vec2(3709.611, 1412.291), vec2(3735.787, 1352.359), vec2(3782.013, 1316.639), vec2(3831.040, 1370.102), vec2(3856.254, 1323.643), vec2(3841.312, 1261.776), vec2(3808.627, 1143.410)
    ]
    drawJew(jewPath);
    drawJew(jewPath);
    drawJew(jewPath);
    drawJew(jewPath);
    drawJew(jewPath);
    drawJew(jewPath);
    //#endregion DRAW JEWS

    //#region DRAW UBER

    drawUber({
      path: [vec2(4376.626, 2105.420), vec2(4261.522, 2106.221), vec2(4229.208, 2135.331), vec2(4216.656, 2191.948), vec2(4220.128, 2271.799), vec2(4226.804, 2362.066), vec2(4225.202, 2450.464), vec2(4225.736, 2490.523), vec2(4177.932, 2507.615), vec2(4111.967, 2487.319), vec2(4015.024, 2471.829), vec2(3889.237, 2474.233), vec2(3812.056, 2477.170), vec2(3802.056, 2477.170), vec2(3814.383, 2547.581), vec2(3971.178, 2547.891), vec2(4127.972, 2548.201), vec2(4205.672, 2547.581), vec2(4262.900, 2555.645), vec2(4291.281, 2530.521), vec2(4293.917, 2468.796), vec2(4290.040, 2403.038), vec2(4288.644, 2333.558), vec2(4288.179, 2264.388), vec2(4288.955, 2196.460), vec2(4290.040, 2133.183), vec2(4302.292, 2102.476), vec2(4380.612, 2103.716)],
      pauseAt: [vec2(4376.626, 2105.420), vec2(3812.056, 2477.170)]
    })

    drawUber({
      path: [vec2(3803.270, 2061.391), vec2(3769.112, 2060.492), vec2(3744.843, 2113.526), vec2(3616.753, 2111.728), vec2(3566.865, 2111.278), vec2(3566.865, 2003.413), vec2(3566.865, 1895.548), vec2(3566.865, 1787.683), vec2(3562.820, 1574.649), vec2(3559.225, 1352.627), vec2(3559.225, 1264.986), vec2(3547.539, 1215.099), vec2(3482.820, 1192.177), vec2(3374.056, 1193.076), vec2(3205.966, 1193.076), vec2(3100.798, 1193.076), vec2(3103.494, 1109.031), vec2(3106.640, 941.840), vec2(3109.787, 782.739), vec2(3113.831, 749.930), vec2(3257.652, 750.379), vec2(3414.506, 749.031), vec2(3471.135, 745.885), vec2(3505.742, 709.930), vec2(3501.697, 548.582), vec2(3499.000, 384.087), vec2(3499.000, 260.492), vec2(3487.315, 216.966), vec2(3399.674, 210.225), vec2(3276.978, 206.629), vec2(3163.719, 198.989), vec2(3141.697, 182.360), vec2(3131.697, 182.360), vec2(3138.551, 258.764), vec2(3343.494, 262.360), vec2(3429.337, 259.663), vec2(3450.011, 317.191), vec2(3442.371, 436.742), vec2(3439.225, 557.640), vec2(3437.876, 670.899), vec2(3441.472, 701.910), vec2(3386.191, 701.910), vec2(3265.573, 697.865), vec2(3118.157, 698.315), vec2(3077.708, 707.303), vec2(3059.281, 746.854), vec2(3057.933, 873.146), vec2(3057.034, 999.888), vec2(3056.584, 1126.629), vec2(3044.449, 1243.483), vec2(3092.090, 1257.416), vec2(3188.719, 1260.562), vec2(3413.438, 1257.865), vec2(3496.135, 1258.764), vec2(3512.315, 1310.000), vec2(3507.371, 1405.281), vec2(3507.820, 1511.348), vec2(3510.067, 1742.360), vec2(3512.315, 1973.371), vec2(3515.461, 2129.326), vec2(3544.674, 2162.584), vec2(3667.371, 2169.775), vec2(3777.933, 2169.775), vec2(3827.371, 2168.427)],
      pauseAt: [vec2(3803.270, 2061.391), vec2(3141.697, 182.360)]
    })

    drawUber({
      path: [vec2(3121.794, 2020.475), vec2(3069.659, 2020.025), vec2(3040.895, 2051.935), vec2(2608.985, 2053.733), vec2(2558.198, 2059.126), vec2(2534.828, 2042.947), vec2(2548.760, 1956.654), vec2(2548.311, 1811.036), vec2(2551.906, 1709.463), vec2(2543.816, 1667.216), vec2(2505.165, 1650.587), vec2(2290.783, 1648.789), vec2(2141.120, 1648.789), vec2(2098.872, 1648.789), vec2(2049.434, 1654.632), vec2(2022.019, 1679.351), vec2(2025.165, 1806.992), vec2(2025.141, 1840.190), vec2(2019.748, 1868.954), vec2(1952.332, 1862.662), vec2(1791.883, 1860.415), vec2(1639.074, 1859.965), vec2(1590.534, 1842.887), vec2(1568.961, 1843.336), vec2(1568.961, 1934.572), vec2(1771.208, 1934.108), vec2(1966.612, 1934.557), vec2(2054.702, 1931.411), vec2(2082.567, 1908.041), vec2(2086.612, 1862.198), vec2(2085.264, 1783.546), vec2(2087.062, 1725.569), vec2(2101.893, 1707.591), vec2(2263.691, 1717.029), vec2(2425.039, 1718.378), vec2(2470.882, 1716.130), vec2(2493.354, 1737.703), vec2(2483.916, 1823.546), vec2(2482.118, 1922.423), vec2(2480.770, 2020.400), vec2(2486.163, 2090.512), vec2(2505.489, 2115.232), vec2(2565.264, 2124.670), vec2(2669.534, 2124.220), vec2(2772.006, 2122.872), vec2(2911.781, 2126.468), vec2(3068.635, 2125.569), vec2(3138.298, 2072.535)],
      pauseAt: [vec2(3121.794, 2020.475), vec2(1590.534, 1842.887)]
    })

    drawUber({
      path: [vec2(1174.894, 2621.259), vec2(1110.175, 2622.158), vec2(1109.725, 2779.910), vec2(1111.523, 2877.888), vec2(1107.478, 2913.843), vec2(1212.653, 2912.437), vec2(1334.001, 2915.583), vec2(1494.001, 2910.639), vec2(1665.687, 2906.145), vec2(1846.361, 2905.696), vec2(2017.597, 2907.044), vec2(2062.091, 2907.943), vec2(2064.788, 2878.729), vec2(2045.013, 2879.628), vec2(2041.417, 2982.100), vec2(1958.721, 2980.302), vec2(1709.732, 2978.954), vec2(1453.103, 2978.055), vec2(1190.181, 2978.055), vec2(1077.822, 2976.257), vec2(1046.810, 2938.954), vec2(1044.114, 2726.819), vec2(1045.013, 2512.887), vec2(1044.563, 2298.504), vec2(1045.013, 2084.122), vec2(1045.462, 1869.740), vec2(1045.912, 1655.358), vec2(1044.114, 1582.549), vec2(1087.260, 1541.651), vec2(1089.507, 1491.763), vec2(1142.091, 1395.134), vec2(1187.845, 1328.781), vec2(1257.058, 1333.275), vec2(1289.418, 1383.163), vec2(1302.901, 1541.814), vec2(1315.935, 1698.219), vec2(1330.317, 1760.241), vec2(1377.957, 1802.039), vec2(1442.227, 1847.882), vec2(1478.631, 1860.017), vec2(1499.306, 1829.005), vec2(1531.665, 1829.005), vec2(1451.665, 1944.511), vec2(1440.879, 2036.646), vec2(1441.777, 2145.410), vec2(1450.317, 2251.477), vec2(1483.126, 2295.522), vec2(1521.328, 2306.758), vec2(1786.497, 2309.455), vec2(2050.317, 2309.904), vec2(2134.362, 2304.511), vec2(2156.384, 2340.466), vec2(2142.452, 2404.736), vec2(2134.362, 2512.151), vec2(2133.912, 2628.556), vec2(2134.811, 2752.151), vec2(2135.710, 2875.747), vec2(2137.957, 2908.107), vec2(1906.047, 2911.702), vec2(1671.890, 2914.399), vec2(1442.227, 2915.747), vec2(1210.766, 2914.399), vec2(1107.845, 2913.949), vec2(1108.294, 2811.927), vec2(1108.744, 2708.107), vec2(1109.193, 2604.286), vec2(1115.036, 2431.702), vec2(1198.182, 2420.916), vec2(1158.182, 2415.972), vec2(1106.946, 2394.848), vec2(1110.480, 2236.806), vec2(1110.480, 2063.772), vec2(1110.480, 1890.738), vec2(1110.929, 1717.705), vec2(1110.480, 1548.716), vec2(1196.772, 1408.491), vec2(1304.637, 1237.705), vec2(1414.300, 1069.165), vec2(1515.180, 1044.761), vec2(1739.449, 1055.099), vec2(1966.865, 1060.492), vec2(2152.483, 1065.885), vec2(2185.742, 1070.829), vec2(2192.034, 1144.537), vec2(2195.123, 1194.654), vec2(2266.134, 1231.508), vec2(2359.168, 1240.946), vec2(2462.089, 1240.496), vec2(2586.134, 1249.036), vec2(2724.561, 1257.575), vec2(2832.426, 1259.822), vec2(2881.864, 1153.305), vec2(2840.965, 1151.957), vec2(2761.415, 1188.362), vec2(2506.134, 1187.013), vec2(2280.516, 1163.193), vec2(2239.168, 1162.294), vec2(2249.954, 1066.114), vec2(2222.988, 1008.586), vec2(1941.190, 1000.047), vec2(1650.853, 991.508), vec2(1443.662, 981.171), vec2(1375.797, 991.508), vec2(1334.448, 1064.317), vec2(1276.021, 1192.856), vec2(1209.055, 1287.687), vec2(1142.089, 1403.643), vec2(1076.471, 1490.384), vec2(1077.819, 1551.508), vec2(1045.010, 1599.148), vec2(1046.808, 1704.317), vec2(1045.460, 1823.867), vec2(1044.111, 1944.317), vec2(1042.763, 2064.766), vec2(1041.415, 2185.216), vec2(1040.066, 2305.665), vec2(1038.718, 2426.114), vec2(1037.370, 2546.564), vec2(1037.370, 2666.114), vec2(1182.089, 2662.519)],
      pauseAt: [vec2(1174.894, 2621.259), vec2(2064.788, 2878.729), vec2(1499.306, 1829.005), vec2(1198.182, 2420.916), vec2(2881.864, 1153.305)]
    })

    drawUber({
      path: [vec2(1174.894, 2621.259), vec2(1110.175, 2622.158), vec2(1109.725, 2779.910), vec2(1111.523, 2877.888), vec2(1107.478, 2913.843), vec2(1212.653, 2912.437), vec2(1334.001, 2915.583), vec2(1494.001, 2910.639), vec2(1665.687, 2906.145), vec2(1846.361, 2905.696), vec2(2017.597, 2907.044), vec2(2062.091, 2907.943), vec2(2064.788, 2878.729), vec2(2045.013, 2879.628), vec2(2041.417, 2982.100), vec2(1958.721, 2980.302), vec2(1709.732, 2978.954), vec2(1453.103, 2978.055), vec2(1190.181, 2978.055), vec2(1077.822, 2976.257), vec2(1046.810, 2938.954), vec2(1044.114, 2726.819), vec2(1045.013, 2512.887), vec2(1044.563, 2298.504), vec2(1045.013, 2084.122), vec2(1045.462, 1869.740), vec2(1045.912, 1655.358), vec2(1044.114, 1582.549), vec2(1087.260, 1541.651), vec2(1089.507, 1491.763), vec2(1142.091, 1395.134), vec2(1187.845, 1328.781), vec2(1257.058, 1333.275), vec2(1289.418, 1383.163), vec2(1302.901, 1541.814), vec2(1315.935, 1698.219), vec2(1330.317, 1760.241), vec2(1377.957, 1802.039), vec2(1442.227, 1847.882), vec2(1478.631, 1860.017), vec2(1499.306, 1829.005), vec2(1531.665, 1829.005), vec2(1451.665, 1944.511), vec2(1440.879, 2036.646), vec2(1441.777, 2145.410), vec2(1450.317, 2251.477), vec2(1483.126, 2295.522), vec2(1521.328, 2306.758), vec2(1786.497, 2309.455), vec2(2050.317, 2309.904), vec2(2134.362, 2304.511), vec2(2156.384, 2340.466), vec2(2142.452, 2404.736), vec2(2134.362, 2512.151), vec2(2133.912, 2628.556), vec2(2134.811, 2752.151), vec2(2135.710, 2875.747), vec2(2137.957, 2908.107), vec2(1906.047, 2911.702), vec2(1671.890, 2914.399), vec2(1442.227, 2915.747), vec2(1210.766, 2914.399), vec2(1107.845, 2913.949), vec2(1108.294, 2811.927), vec2(1108.744, 2708.107), vec2(1109.193, 2604.286), vec2(1115.036, 2431.702), vec2(1198.182, 2420.916), vec2(1158.182, 2415.972), vec2(1106.946, 2394.848), vec2(1110.480, 2236.806), vec2(1110.480, 2063.772), vec2(1110.480, 1890.738), vec2(1110.929, 1717.705), vec2(1110.480, 1548.716), vec2(1196.772, 1408.491), vec2(1304.637, 1237.705), vec2(1414.300, 1069.165), vec2(1515.180, 1044.761), vec2(1739.449, 1055.099), vec2(1966.865, 1060.492), vec2(2152.483, 1065.885), vec2(2185.742, 1070.829), vec2(2192.034, 1144.537), vec2(2195.123, 1194.654), vec2(2266.134, 1231.508), vec2(2359.168, 1240.946), vec2(2462.089, 1240.496), vec2(2586.134, 1249.036), vec2(2724.561, 1257.575), vec2(2832.426, 1259.822), vec2(2881.864, 1153.305), vec2(2840.965, 1151.957), vec2(2761.415, 1188.362), vec2(2506.134, 1187.013), vec2(2280.516, 1163.193), vec2(2239.168, 1162.294), vec2(2249.954, 1066.114), vec2(2222.988, 1008.586), vec2(1941.190, 1000.047), vec2(1650.853, 991.508), vec2(1443.662, 981.171), vec2(1375.797, 991.508), vec2(1334.448, 1064.317), vec2(1276.021, 1192.856), vec2(1209.055, 1287.687), vec2(1142.089, 1403.643), vec2(1076.471, 1490.384), vec2(1077.819, 1551.508), vec2(1045.010, 1599.148), vec2(1046.808, 1704.317), vec2(1045.460, 1823.867), vec2(1044.111, 1944.317), vec2(1042.763, 2064.766), vec2(1041.415, 2185.216), vec2(1040.066, 2305.665), vec2(1038.718, 2426.114), vec2(1037.370, 2546.564), vec2(1037.370, 2666.114), vec2(1182.089, 2662.519)],
      pauseAt: [vec2(1174.894, 2621.259), vec2(2064.788, 2878.729), vec2(1499.306, 1829.005), vec2(1198.182, 2420.916), vec2(2881.864, 1153.305)]
    })

    drawUber({
      path: [vec2(3602.604, 2894.213), vec2(3646.199, 2890.168), vec2(3672.716, 2923.876), vec2(3710.918, 2959.831), vec2(3729.345, 3003.876), vec2(3947.772, 3003.876), vec2(4166.199, 3002.527), vec2(4245.750, 2998.033), vec2(4272.716, 2983.201), vec2(4295.637, 2953.988), vec2(4294.469, 2824.893), vec2(4294.469, 2681.972), vec2(4294.469, 2539.050), vec2(4290.874, 2373.208), vec2(4287.278, 2218.151), vec2(4291.323, 2161.972), vec2(4308.851, 2137.702), vec2(4347.503, 2151.635), vec2(4375.818, 2179.949), vec2(4573.570, 2179.949), vec2(4662.559, 2179.050), vec2(4827.053, 2140.848), vec2(4995.143, 2092.758), vec2(5160.537, 2049.163), vec2(5472.447, 1966.466), vec2(5481.885, 1874.331), vec2(5490.775, 1761.134), vec2(5476.843, 1657.763), vec2(5444.483, 1531.920), vec2(5414.371, 1411.471), vec2(5397.742, 1376.864), vec2(5518.191, 1366.527), vec2(5688.528, 1375.965), vec2(5802.685, 1372.819), vec2(5853.921, 1376.415), vec2(5861.112, 1465.853), vec2(5854.820, 1580.460), vec2(5857.966, 1699.111), vec2(5859.315, 1819.111), vec2(5860.214, 1926.527), vec2(5888.528, 1938.213), vec2(6041.787, 1938.662), vec2(6152.483, 1940.460), vec2(6260.483, 1940.460), vec2(6263.483, 1940.460), vec2(6263.045, 1893.269), vec2(6259.899, 1866.465), vec2(6201.921, 1864.667), vec2(6034.730, 1864.667), vec2(5967.764, 1866.016), vec2(5908.438, 1873.656), vec2(5867.539, 1890.285), vec2(5863.494, 2033.656), vec2(5868.888, 2200.847), vec2(5870.685, 2367.139), vec2(5872.483, 2533.431), vec2(5874.281, 2699.724), vec2(5876.079, 2866.016), vec2(5879.225, 3001.746), vec2(5871.584, 3028.712), vec2(5824.393, 3079.499), vec2(5587.539, 3344.667), vec2(5383.045, 3591.409), vec2(5306.640, 3681.746), vec2(5299.449, 3698.825), vec2(4934.955, 3699.274), vec2(4582.146, 3699.274), vec2(4357.427, 3566.690), vec2(4186.640, 3683.544), vec2(4008.213, 3802.196), vec2(3828.438, 3911.858), vec2(3758.775, 3948.263), vec2(3729.112, 3916.353), vec2(3746.191, 3763.094), vec2(3746.191, 3571.184), vec2(3747.090, 3423.769), vec2(3738.995, 3373.299), vec2(3703.040, 3352.625), vec2(3538.096, 3352.625), vec2(3326.860, 3353.973), vec2(3267.984, 3346.782), vec2(3277.872, 3189.479), vec2(3284.613, 3030.378), vec2(3295.400, 2977.344), vec2(3374.501, 2989.479), vec2(3481.018, 2993.973), vec2(3540.793, 2992.175)],
      pauseAt: [vec2(3602.604, 2894.213), vec2(6260.483, 1940.460)]
    })
    //#endregion DRAW UBER

    //#region DRAW TROTTS
    function spawnTrott(props: TrottProps) {
      const o1 = drawTrott(props);

      o1.onDestroy(() => {
        spawner.wait(randi(5, 15), () => {
          spawnTrott(props);
        });
      })
    }
    spawnTrott({
      path: [vec2(3454.624, 2460.499), vec2(3436.376, 2456.351), vec2(3423.791, 2482.418), vec2(3284.915, 2487.362), vec2(3176.600, 2486.913), vec2(3164.465, 2471.632), vec2(3168.061, 2391.182), vec2(3172.106, 2308.935), vec2(3171.207, 2225.789), vec2(3170.308, 2144.890), vec2(3133.904, 2102.643), vec2(3039.545, 2075.776), vec2(2940.219, 2049.259), vec2(2800.893, 2048.810), vec2(2650.781, 2050.607), vec2(2553.702, 2052.405), vec2(2542.017, 2030.383), vec2(2555.051, 1891.506), vec2(2554.601, 1731.956), vec2(2540.219, 1667.686), vec2(2472.803, 1644.765), vec2(2386.062, 1645.214), vec2(2379.770, 1618.697), vec2(2320.893, 1647.461), vec2(2177.073, 1647.461), vec2(2113.253, 1647.911), vec2(2028.758, 1734.203), vec2(2022.916, 1789.034), vec2(2029.223, 1836.084), vec2(2021.583, 1874.287), vec2(1835.965, 1864.848), vec2(1542.481, 1860.803), vec2(1402.869, 2027.997), vec2(1375.453, 2177.660), vec2(1309.835, 2216.761), vec2(1253.656, 2192.491), vec2(1223.094, 2192.941), vec2(1115.229, 2234.738), vec2(1044.667, 2348.446), vec2(1039.274, 2576.761), vec2(1042.869, 2804.176), vec2(1059.049, 2961.480), vec2(1101.296, 2982.154), vec2(1488.262, 2985.749), vec2(1854.105, 2985.749), vec2(2139.948, 2982.154), vec2(2145.341, 3072.491), vec2(2146.689, 3214.064), vec2(2147.588, 3336.311), vec2(2174.554, 3387.098), vec2(2491.408, 3398.334), vec2(2583.543, 3289.570), vec2(2698.599, 3284.626), vec2(2755.678, 3410.019), vec2(3108.038, 3419.907), vec2(3292.757, 3423.053), vec2(3619.049, 3417.660), vec2(3680.622, 3419.008), vec2(3682.420, 3510.244), vec2(3675.678, 3665.300), vec2(3677.925, 3775.412), vec2(3700.397, 3786.199), vec2(3736.352, 3782.603), vec2(3752.532, 3747.098), vec2(3747.139, 3623.053), vec2(3746.689, 3487.323), vec2(3749.386, 3448.671), vec2(3585.790, 3339.907), vec2(3353.880, 3344.401), vec2(3274.779, 3351.592), vec2(3275.229, 3209.570), vec2(3285.116, 3038.334), vec2(3272.981, 2996.087), vec2(3537.251, 2990.693), vec2(3585.341, 2892.266), vec2(3643.768, 2885.974), vec2(3728.262, 2996.985), vec2(4001.521, 2996.536), vec2(4241.071, 2994.289), vec2(4294.105, 2968.671), vec2(4295.903, 2825.300), vec2(4289.611, 2685.525), vec2(4300.397, 2563.727), vec2(4129.161, 2496.311), vec2(3833.166, 2486.673), vec2(3538.334, 2489.370)],
      pauseAt: [vec2(3454.624, 2460.499), vec2(2379.770, 1618.697), vec2(1253.656, 2192.491), vec2(3585.341, 2892.266), vec2(2583.543, 3289.570), vec2(3452.624, 2460.499)]
    })
    spawnTrott({
      path: [vec2(3199.328, 1150.449), vec2(3243.373, 1150.899), vec2(3267.193, 1190.899), vec2(3281.575, 1260.112), vec2(3621.800, 1258.764), vec2(3958.429, 1258.315), vec2(4206.519, 1253.820), vec2(4241.125, 1240.337), vec2(4266.288, 1211.301), vec2(4260.446, 1075.121), vec2(4258.648, 932.649), vec2(4264.940, 801.863), vec2(4266.288, 782.986), vec2(4372.356, 786.132), vec2(4480.221, 788.380), vec2(4588.086, 790.627), vec2(4694.153, 792.425), vec2(4714.828, 799.166), vec2(4715.277, 867.031), vec2(4710.783, 1137.593), vec2(4706.288, 1406.357), vec2(4708.535, 1500.290), vec2(4704.041, 1544.784), vec2(4609.659, 1520.514), vec2(4267.637, 1521.413), vec2(4229.434, 1543.885), vec2(4179.547, 1557.818), vec2(4135.951, 1528.155), vec2(4116.176, 1515.571), vec2(4089.659, 1480.514), vec2(4037.974, 1480.065), vec2(4008.311, 1516.919), vec2(3924.266, 1645.908), vec2(3915.726, 1775.795), vec2(3916.625, 1946.132), vec2(3916.176, 2068.829), vec2(3953.929, 2163.211), vec2(4155.277, 2173.998), vec2(4224.041, 2171.750), vec2(4234.828, 2211.301), vec2(4229.434, 2429.728), vec2(4231.232, 2473.773), vec2(4193.479, 2494.447), vec2(4012.356, 2481.413), vec2(3924.715, 2480.964), vec2(3921.120, 2443.211)],
      pauseAt: [vec2(3199.328, 1150.449), vec2(4089.659, 1480.514)]
    })
    spawnTrott({
      path: [vec2(5666.983, 1282.990), vec2(5711.028, 1282.092), vec2(5851.252, 1383.665), vec2(5855.747, 1571.080), vec2(5861.140, 1754.451), vec2(5866.530, 1937.720), vec2(5868.328, 2124.237), vec2(5866.530, 2305.360), vec2(5870.126, 2495.023), vec2(5868.777, 2681.990), vec2(5870.575, 2871.203), vec2(5869.676, 3007.383), vec2(5814.845, 3071.203), vec2(5641.811, 3280.192), vec2(5465.182, 3487.832), vec2(5304.732, 3677.945), vec2(5295.744, 3692.776), vec2(5111.474, 3689.181), vec2(4842.261, 3691.428), vec2(4620.688, 3692.776), vec2(4370.800, 3546.709), vec2(4092.148, 3745.360), vec2(3802.710, 3919.742), vec2(3753.721, 3944.461), vec2(3742.036, 3920.192), vec2(3751.025, 3696.821), vec2(3747.879, 3460.866), vec2(3752.373, 3382.664), vec2(3723.609, 3345.360), vec2(3594.171, 3343.563), vec2(3454.395, 3342.664), vec2(3411.699, 3309.855), vec2(0.000, 0.000), vec2(3380.238, 3310.754), vec2(3344.283, 3349.855), vec2(3285.856, 3348.057), vec2(3266.530, 3336.821), vec2(3278.665, 3251.428), vec2(3288.103, 3089.181), vec2(3284.508, 3001.091), vec2(3329.452, 2986.259), vec2(3569.002, 2997.046), vec2(3824.283, 2997.046), vec2(4080.014, 2997.046), vec2(4177.991, 2999.293), vec2(4284.957, 2867.608), vec2(4294.845, 2774.574), vec2(4295.744, 2631.203), vec2(4296.643, 2507.608), vec2(4294.845, 2295.473), vec2(4294.845, 2193.001), vec2(4251.699, 2097.720), vec2(4022.935, 2099.068), vec2(3983.384, 2098.619), vec2(3982.486, 1999.293), vec2(3986.530, 1843.788), vec2(3987.879, 1690.080), vec2(3984.283, 1606.934), vec2(4014.396, 1581.765), vec2(4220.688, 1588.057), vec2(4428.778, 1592.102), vec2(4636.418, 1594.799), vec2(4692.598, 1595.248), vec2(4766.306, 1466.259), vec2(4785.182, 1375.024), vec2(4788.328, 1227.608), vec2(4788.311, 1080.989), vec2(4786.513, 922.784), vec2(4785.165, 819.862), vec2(4724.940, 723.683), vec2(4559.547, 721.435), vec2(4254.828, 722.334), vec2(4190.558, 847.278), vec2(4185.165, 989.301), vec2(4187.412, 1125.930), vec2(4187.862, 1162.334), vec2(4180.671, 1187.503), vec2(4084.042, 1183.009), vec2(3636.851, 1186.155), vec2(3248.536, 1182.559), vec2(3222.918, 1152.447), vec2(3185.615, 1152.896), vec2(3144.515, 1192.888), vec2(3113.953, 1188.393), vec2(3120.245, 988.393), vec2(3122.942, 800.978), vec2(3122.942, 766.820), vec2(3382.268, 764.124), vec2(3449.234, 761.877), vec2(3482.942, 757.832), vec2(3508.110, 741.652), vec2(3507.661, 507.045), vec2(3503.616, 294.011), vec2(3500.919, 234.686), vec2(3467.661, 198.539), vec2(3349.459, 224.607), vec2(2964.740, 219.213), vec2(2838.447, 189.101), vec2(2778.672, 194.045), vec2(2769.234, 249.775), vec2(2772.829, 395.393), vec2(2764.290, 425.056), vec2(2358.897, 411.124), vec2(2259.122, 409.326), vec2(2231.706, 585.955), vec2(2223.616, 835.393), vec2(2232.605, 871.798), vec2(2258.469, 885.359), vec2(2497.571, 888.055), vec2(2526.465, 892.541), vec2(2508.937, 1128.047), vec2(2631.634, 1254.339), vec2(3026.690, 1267.822), vec2(3425.342, 1266.024), vec2(3813.207, 1253.440), vec2(4163.319, 1257.485), vec2(4241.072, 1247.597), vec2(4270.735, 1150.519), vec2(4265.791, 888.945), vec2(4262.196, 804.002), vec2(4297.252, 773.889), vec2(4693.207, 797.260), vec2(4948.038, 804.901), vec2(5206.016, 747.372), vec2(5268.038, 920.856), vec2(5325.717, 1108.333), vec2(5381.896, 1292.154), vec2(5473.132, 1346.086), vec2(5660.983, 1282.990)],
      pauseAt: [vec2(3411.699, 3309.855), vec2(3222.918, 1152.447), vec2(5660.983, 1282.990)]
    })
    //#endregion DRAW TROTTS

    drawOldPeople({
      path: [vec2(5432.034, 1253.638), vec2(5570.011, 1268.919), vec2(5776.753, 1277.458), vec2(5866.640, 1272.514), vec2(5814.506, 1421.728), vec2(5817.652, 1557.458), vec2(5746.640, 1538.132), vec2(5680.810, 1576.399), vec2(5624.631, 1641.118), vec2(5640.361, 1690.107), vec2(5675.867, 1747.635), vec2(5701.934, 1811.905), vec2(5714.069, 1866.736), vec2(5775.192, 1836.624), vec2(5825.080, 1818.646), vec2(5970.698, 1816.399), vec2(5975.642, 1704.040), vec2(5968.451, 1584.489), vec2(5942.833, 1511.680), vec2(5937.889, 1395.276), vec2(5938.339, 1311.231)],
      pauseAt: [vec2(5866.640, 1272.514), vec2(5825.080, 1818.646)],
      types: ["tourist"],
      speed: 25,
      destroyOnLast: false
    });

    drawPoliceMan(
      [vec2(254.543, 2208.894), vec2(254.190, 2087.616), vec2(644.818, 2088.007), vec2(644.994, 2213.516)],
      vec2(644.994, 2213.516),
    );

    drawBoat({
      path: [
        vec2(1122.360, -56.136), vec2(1157.092, 77.931), vec2(1198.076, 228.669), vec2(1261.984, 399.551), vec2(1278.655, 499.928), vec2(1217.527, 641.288), vec2(1161.260, 783.343), vec2(1102.215, 924.703), vec2(1009.138, 1048.868), vec2(930.921, 1185.581), vec2(850.698, 1322.294), vec2(731.701, 1406.194), vec2(610.030, 1495.442), vec2(481.803, 1596.138), vec2(349.436, 1696.082), vec2(232.646, 1745.218), vec2(126.351, 1806.388), vec2(28.078, 1848.171), vec2(37.437, 2035.023), vec2(197.883, 1938.422), vec2(404.457, 1816.416), vec2(598.329, 1695.748), vec2(807.577, 1563.714), vec2(955.320, 1417.642), vec2(1093.705, 1253.519), vec2(1193.315, 1091.402), vec2(1269.413, 924.123), vec2(1336.933, 754.652), vec2(1389.747, 579.833), vec2(1401.780, 409.694), vec2(1370.988, 239.457), vec2(1318.843, 76.462), vec2(1288.759, -32.507)
      ],
      takeArea: [vec2(1398.661, 895.738), vec2(1339.162, 1014.401), vec2(1427.407, 1062.869), vec2(1478.215, 964.930)],
      dropPoint: vec2(964.120, 948.552),
      stops: [[vec2(1384.427, 768.603), vec2(1460.458, 795.286), vec2(1469.926, 768.029), vec2(1407.093, 739.625)], [vec2(972.466, 1048.343), vec2(954.965, 1074.452), vec2(926.561, 1057.524), vec2(940.619, 1030.267)]]
    });

    drawWater([
      vec2(803.387, 1684.938), vec2(580.123, 1442.712), vec2(287.690, 1636.333), vec2(287.448, 1852.784), vec2(288.783, 2019.698)
    ]);

    drawWin([
      vec2(887.150, 870.555), vec2(857.007, 725.304), vec2(827.921, 581.463), vec2(873.224, 471.114), vec2(958.718, 434.448), vec2(1021.296, 464.415),
      vec2(1071.888, 503.196), vec2(1103.089, 552.906), vec2(1094.098, 626.237), vec2(1072.769, 707.324), vec2(1050.735, 789.116), vec2(1027.995, 869.498)
    ])

    function onEnnemiHit(sound: string[] = ["hit"]) {
      if (!player.isReady) {
        return;
      }
      player.isReady = false;
      isMoving = false;
      play(sound[randi(0, sound.length)], {volume: VOLUME_DEFAULT});
      const loops = 21;
      player.blink({
        duration: 3,
        loops: loops,
        onLoop: (loop) => {
          if (loop > Math.floor(loops / 1.5)) {
            player.pos = player.lastGoodPos;
            player.lastGoodPos = player.pos;
          }
        },
        onFinish: () => {
          player.pos = player.lastGoodPos;
          player.lastGoodPos = player.pos;
          player.isReady = true;
        }
      });
      shake();
    }


    if (ENABLE_COLLISION) {
      player.onCollide("sound_trigger", (obj: GameObj<{playSound: () => void}>) => {
        obj.playSound()
      });

      player.onCollide("people", () => {
        onEnnemiHit(["ela", "mo-joenge-toch"]);
      });

      player.onCollide("hole", () => {
        onEnnemiHit(["god"]);
      });

      player.onCollide("bicycle", () => {
        onEnnemiHit(["ela", "paljas"]);
      });

      player.onCollide("car", () => {
        onEnnemiHit(["vehicle_hit"]);
      });

      player.onCollide("police", (obj: GameObj<{playAnim: () => void}>) => {
        obj.playAnim()
        onEnnemiHit(["ela"]);
      });

      player.onCollide("road", (o, col) => {
        if (!player.isReady) return;
        isMoving = false;
        if (col.hasOverlap()) {
          player.moveBy(col.displacement.scale(2));
        }
      });

      player.onCollide("kebab", (obj) => {
        if (!player.isReady) return;
        obj.destroy();
        play("kebab", {volume: VOLUME_DEFAULT});
        player.speed += 25;
        maxSpeedText.text = `Max Speed: ${calculateShownSpeed(player.speed)}`;
      });

      player.onCollide("win", () => {
        if (!player.isReady) return;
        idlePlayerSoundPlayer.stop();
        movingPlayerSoundPlayer.stop();
        WIN_AUDIO_PLAYER = play("game_win", {volume: VOLUME_DEFAULT});
        go("instructions", {asset: "game_win", sceneToGo: "level3", animateToNext: false, isEnd: true});
      })
    }
  });
}