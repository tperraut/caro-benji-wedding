function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function createLevel3Scene() {
  return scene("level3", () => {

    let isMoving = false;
    let targetPos = vec2(0, 0);
    let countdownTime = 120; // 2 minutes


    setGravity(0);

    add([pos(0, 0), rect(width(), height()), color("#FFFFFF")]);
    const background = add(["background", sprite("level3BG", {fill: true}), anchor("topleft")]);

    const player = add([
      "player",
      sprite("benji"),
      scale(vec2(0.12, 0.12)),
      pos(2938, 808),
      anchor("center"),
      area({shape: new Rect(vec2(0, 0), 300, 300)}), // Use a circle for better collision
      rotate(),
      {
        speed: 200,
        moveDirection: vec2(0, 0)
      }
    ]);

    const timerText = add([
      text("00:00", {
        size: 48,
        font: "monospace", // Use monospace for consistent spacing
      }),
      pos(width() / 2, 50),
      anchor("center"),
      color(0, 0, 0),
      outline(2, rgb(0, 0, 0)), // Black outline for better visibility
      layer("ui"),
      fixed(), // Stay in place when camera moves
    ]);

    // Get background dimensions for camera bounds
    const bgWidth = background.width;
    const bgHeight = background.height;
    const screenWidth = width();
    const screenHeight = height();

    // Camera follows player with bounds checking
    onUpdate(() => {
      countdownTime -= dt();
      if (countdownTime <= 0) {
        // TODO : game over logic
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
        const dist = player.pos.dist(targetPos);
        if (dist < 5) {
          console.log("Reached target position:", targetPos);
          isMoving = false;
        } else {
          const moveSpeed = player.speed * dt();
          player.pos = player.pos.add(player.moveDirection.scale(moveSpeed));
        }
      }
    });

    onDraw(() => {
      // drawRect({
      //   pos: player.pos,
      //   width: 300 * player.scale.x,
      //   height: 300 * player.scale.y,
      //   fill: false,
      //   anchor: "center",
      //   outline: {color: rgb(0, 255, 0), width: 3}, // 3px green outline only
      // });
      if (isMoving) return;

      const worldMousePos = toWorld(mousePos());

      // Draw line from player to mouse
      drawLine({
        p1: player.pos,
        p2: worldMousePos,
        width: 2,
        color: rgb(255, 0, 0),
      });

      drawCircle({
        pos: worldMousePos,
        radius: 5,
        color: rgb(0, 0, 255),
      });
    });


    onClick(() => {
      if (isMoving) return;

      isMoving = true;
      targetPos = toWorld(mousePos());
      const dir = targetPos.sub(player.pos).unit();
      if (!player.flipX) {
        player.flipX = true;
      }

      const angle = dir.angle();
      if (angle < -90 || angle > 90) {
        player.flipY = true;
      } else {
        player.flipY = false;
      }

      player.angle = angle;
      player.moveDirection = dir;
    });

    // Pixel perfect collision shapes for Antwerp road circuit (3282 × 1846)

    // Define the drivable road area - main circuit path (green debug)
    // const roadBounds = add([
    //   pos(0, 0),
    //   polygon([
    //     // Outer boundary of the road circuit
    //     vec2(120, 400), vec2(400, 320), vec2(700, 280), vec2(1000, 260),
    //     vec2(1300, 270), vec2(1600, 290), vec2(1900, 320), vec2(2200, 360),
    //     vec2(2500, 410), vec2(2800, 470), vec2(3100, 540), vec2(3280, 620),
    //     vec2(3280, 720), vec2(3200, 820), vec2(3100, 920), vec2(2980, 1020),
    //     vec2(2850, 1120), vec2(2700, 1220), vec2(2550, 1320), vec2(2400, 1400),
    //     vec2(2200, 1460), vec2(2000, 1500), vec2(1800, 1520), vec2(1600, 1530),
    //     vec2(1400, 1520), vec2(1200, 1500), vec2(1000, 1470), vec2(800, 1430),
    //     vec2(600, 1380), vec2(400, 1320), vec2(250, 1240), vec2(150, 1140),
    //     vec2(80, 1020), vec2(50, 900), vec2(40, 780), vec2(60, 660),
    //     vec2(100, 540), vec2(120, 400)
    //   ], {fill: false}),
    //   area(),
    //   outline(3, rgb(0, 255, 0), 1),
    //   "roadOuter"
    // ]);

    // const whole = add([
    //   pos(2575, 478),
    //   circle(10, {fill: false}),
    //   area(),
    //   outline(3, rgb(0, 255, 0), 1),
    //   "hole"
    // ]);

    // // Collision detection - keep player on road
    player.onCollide("roadOuter", () => {
      console.log("Collided with road outer boundary");
    });

    player.onCollide("hole", () => {
      console.log("Collided with hole");
    });

    // player.onCollide("obstacle", () => {
    //   isMoving = false;
    //   // Push player back
    //   player.pos = player.pos.sub(player.moveDirection.scale(40));
    // });

    // player.onCollide("building", () => {
    //   isMoving = false;
    //   // Push player back
    //   player.pos = player.pos.sub(player.moveDirection.scale(30));
    // });

    // player.onCollide("water", () => {
    //   isMoving = false;
    //   // Push player back strongly from water
    //   player.pos = player.pos.sub(player.moveDirection.scale(60));
    // });

    // // Enhanced movement validation
    // let lastValidPos = player.pos;

    // // Save last valid position when not moving
    // player.onUpdate(() => {
    //   if (!isMoving) {
    //     lastValidPos = player.pos;
    //   }
    // });
  });
}