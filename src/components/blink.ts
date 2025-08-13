import {Comp} from "kaplay";

interface BlinkProps {
  duration?: number;
  loops?: number;
  onFinish?: () => void;
  onLoop?: (loop: number) => void;
}

interface BlinkComp extends Comp {
  blink: (props: BlinkProps) => void;
}

export function blink(): BlinkComp {
  return {
    id: "blink",
    blink({duration = 0.5, loops = 1, onFinish, onLoop}: BlinkProps) {
      let flashCount = 0;
      const timeToWait = duration / loops;
      const flash = () => {
        onLoop?.(flashCount);
        if (flashCount >= loops) {
          this.opacity = 1;
          onFinish?.();
          return;
        };
        this.opacity = this.opacity === 1 ? 0.5 : 1;
        flashCount++;
        wait(timeToWait, flash);
      };
      flash();
    }
  }
}