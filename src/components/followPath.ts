import {AnimateComp, AreaComp, Comp, GameObj, PosComp, RotateComp, SpriteComp, Vec2} from "kaplay";

interface FollowPathProps {
  path: Vec2[];
  startI?: number;
  speed?: number;
  controlAngle?: boolean;
  offsetY?: number;
  destroyOnLast?: boolean;
  pauseDelay?: number;
  flipX?: boolean;
  onMove?: (self: GameObj, lastPos: Vec2, targetPos: Vec2, angle?: number) => void;
}

/**
 * @group Component Types
 */
interface FollowPathComp extends Comp {
  id: string;
}

export function followPath({path, startI = 0, speed = 100, controlAngle = true, offsetY = 0, destroyOnLast = false, pauseDelay = 0, flipX = true, onMove}: FollowPathProps): FollowPathComp {
  let i = startI;
  let lastTargetPos: Vec2 | null = null;
  let targetPos = path[i];
  let requires = ["pos"];

  if (controlAngle) {
    requires.push("rotate", "sprite", "area");
  }

  return {
    id: "followPath",
    require: requires,
    update(this: GameObj<PosComp | SpriteComp | RotateComp | AreaComp | AnimateComp | {speed?: number, isPaused: boolean}>) {
      let dist = this.pos.dist(targetPos);

      if (dist < 1) {
        if (!this.isPaused && pauseDelay > 0) {
          this.isPaused = true;
          wait(pauseDelay, () => {
            this.isPaused = false;
          });
        }

        if (destroyOnLast && i == path.length - 1) {
          this.destroy();
          return;
        }
        i = (i + 1) % path.length;
        lastTargetPos = targetPos;
        targetPos = path[i];

        if (controlAngle) {
          this.flipX = flipX;
          const dir = targetPos.sub(this.pos).unit();
          const angle = dir.angle();
          if (angle < -90 || angle > 90) {
            this.flipY = true;
            this.area.offset.y = -offsetY;
          } else {
            this.flipY = false;
            this.area.offset.y = offsetY;
          }

          this.angle = angle;
        }
      }
      if (this.isPaused) {
        return;
      }
      onMove?.(this, lastTargetPos, targetPos, this.angle);
      this.moveTo(targetPos, this.speed || speed);
    }
  };
}