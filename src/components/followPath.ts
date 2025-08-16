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
  pauseAt?: Vec2[];
  onMove?: (self: GameObj, lastPos: Vec2, targetPos: Vec2, angle?: number) => void;
}

/**
 * @group Component Types
 */
interface FollowPathComp extends Comp {
  id: string;
}

export function followPath({path, startI = 0, speed = 100, controlAngle = true, offsetY = 0, destroyOnLast = false, pauseDelay = 0, flipX = true, pauseAt, onMove}: FollowPathProps): FollowPathComp {
  let i = startI;
  let lastTargetPos: Vec2 | null = null;
  let targetPos = path[i];
  let requires = ["pos"];
  let lastPausePos: Vec2 | null = null;

  if (controlAngle) {
    requires.push("rotate", "sprite", "area");
  }

  return {
    id: "followPath",
    require: requires,
    update(this: GameObj<PosComp | SpriteComp | RotateComp | AreaComp | AnimateComp | {speed?: number, isPaused: boolean}>) {
      let dist = this.pos.dist(targetPos);

      if (!this.isPaused && pauseDelay > 0 && pauseAt) {
        for (const pausePoint of pauseAt) {
          if (lastPausePos === pausePoint || this.pos.dist(pausePoint) > 1) continue;

          lastPausePos = pausePoint;
          this.isPaused = true;
          wait(pauseDelay, () => {
            this.isPaused = false;
          });
          break;
        }
      }

      if (dist < 1) {
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