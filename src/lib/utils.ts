import type { Transition, TransitionStyle } from './types';

export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (t: number) => {
    let x = 0;
    let t0 = 0,
      t1 = 1,
      mid = 0;
    for (let i = 0; i < 20; i++) {
      mid = (t0 + t1) / 2;
      x = 3 * x1 * (1 - mid) ** 2 * mid + 3 * x2 * (1 - mid) * mid ** 2 + mid ** 3;
      if (Math.abs(t - x) < 1e-5) break;
      x < t ? (t0 = mid) : (t1 = mid);
    }
    return 3 * y1 * (1 - mid) ** 2 * mid + 3 * y2 * (1 - mid) * mid ** 2 + mid ** 3;
  };
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getEasingFunction(transitionType: TransitionStyle): Transition {
  switch (transitionType) {
    default: {
      return {
        entry: [
          {
            property: 'transformX',
            duration: 300,
            interpolator: cubicBezier(0.52, 0.85, 0.54, 0.91),
            from: window.screen.width,
            to: 0
          }
        ],
        exit: [
          {
            property: 'transformX',
            duration: 300,
            interpolator: cubicBezier(1, 0.06, 0.96, 0.32),
            from: 0,
            to: window.screen.height
          }
        ]
      };
    }
  }
}
