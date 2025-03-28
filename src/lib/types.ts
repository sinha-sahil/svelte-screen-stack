export type State = {
  activeScreen: string | null;
  stack: Array<string>;
  slicedContent: Array<string>;
  animation: ScreenAnimation;
};

export type ScreenAnimation = TransitionStyle | Transition | null;

export type Interpolator = (t: number) => number;

export type TransitionStyle = 'slide';

export type Easing = {
  property: 'transformX' | 'transformY' | 'opacity' | 'scale';
  duration: number;
  interpolator: Interpolator;
  from: number;
  to: number;
};

export type Transition = {
  entry: Array<Easing>;
  exit: Array<Easing>;
};

export type AnimationDirection = 'forward' | 'reverse';
export type AnimationType = 'entry' | 'exit';
