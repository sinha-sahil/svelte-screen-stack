<script lang="ts">
  import { tweened, type Tweened } from 'svelte/motion';
  import state from './state';
  import { getEasingFunction, sleep } from './utils';
  import { onMount } from 'svelte';
  import type { AnimationDirection, AnimationType, Easing, State, Transition } from './types';

  export let name: string;

  let runExitAnimation = false;
  let visibleScreen: string | null = null;

  let entryAnimationDuration: number = -1;
  let exitAnimationDuration: number = -1;

  let currentElement: HTMLElement | null = null;

  type TweenState = { fn: Tweened<number> } & Easing;

  let entryTweens: TweenState[] = [];
  let exitTweens: TweenState[] = [];

  function startEntryAnimation() {
    runExitAnimation = false;

    entryTweens.forEach((tweenSt) => {
      tweenSt.fn.set(tweenSt.to);
    });
  }

  function endEntryAnimation(direction: AnimationDirection = 'forward') {
    entryTweens.forEach((tweenSt) => {
      const multiplier = tweenSt.property.includes('transform') && direction === 'forward' ? -1 : 1;
      tweenSt.fn.set(multiplier * tweenSt.from);
    });
  }

  function startExitAnimation(direction: AnimationDirection = 'forward') {
    runExitAnimation = true;

    exitTweens.forEach((tweenSt) => {
      const multiplier = tweenSt.property.includes('transform') && direction === 'forward' ? -1 : 1;
      tweenSt.fn.set(multiplier * tweenSt.to);
    });
  }

  function endExitAnimation() {
    exitTweens.forEach((tweenSt) => {
      tweenSt.fn.set(tweenSt.from);
    });
  }

  async function startAnimation(
    type: AnimationType = 'entry',
    direction: AnimationDirection = 'forward'
  ) {
    if (type === 'exit') {
      startExitAnimation(direction);
      await sleep(300);
      endEntryAnimation(direction);
    } else {
      startEntryAnimation();
      await sleep(300);
      endExitAnimation();
    }
  }

  onMount(() => {
    const animation = $state.animation;

    let easingMethods: Transition | null = null;

    if (typeof animation === 'string') {
      easingMethods = getEasingFunction(animation);
    } else if (animation !== null) {
      easingMethods = animation;
    }

    if (easingMethods !== null) {
      easingMethods.entry.forEach((animation) => {
        const animTween = tweened(animation.from, {
          duration: animation.duration,
          easing: animation.interpolator
        });
        entryAnimationDuration = Math.max(entryAnimationDuration, animation.duration);
        entryTweens.push({ ...animation, fn: animTween });

        animTween.subscribe((x) => {
          if (!runExitAnimation) {
            currentElement?.style.setProperty(
              `--${animation.property}`,
              `${x}${animation.property.includes('transform') ? 'px' : ''}`
            );
          }
        });
      });

      easingMethods.exit.forEach((animation) => {
        const animTween = tweened(animation.from, {
          duration: animation.duration,
          easing: animation.interpolator
        });
        exitAnimationDuration = Math.max(exitAnimationDuration, animation.duration);
        exitTweens.push({ ...animation, fn: animTween });

        animTween.subscribe((x) => {
          if (runExitAnimation) {
            currentElement?.style.setProperty(
              `--${animation.property}`,
              `${x}${animation.property.includes('transform') ? 'px' : ''}`
            );
          }
        });
      });
    }

    state.subscribe(async (x: State) => {
      const isEntry = x.activeScreen == name;
      const stackIndex = x.stack.lastIndexOf(name);
      const slicedStackIndex = x.slicedContent.lastIndexOf(name);
      const isExit = stackIndex !== -1 && stackIndex === x.stack.length - 2;
      const isBack = slicedStackIndex !== -1 && slicedStackIndex === x.slicedContent.length - 1;
      const isRevisit = isEntry && x.slicedContent.length > 0;

      if (isEntry) {
        visibleScreen = x.activeScreen;
        await startAnimation();
      } else if (isExit) {
        await startAnimation('exit');
        visibleScreen = null;
      } else if (isBack) {
        await startAnimation('exit', 'reverse');
        visibleScreen = null;
      } else if (isRevisit) {
        visibleScreen = x.activeScreen;
        await startAnimation('entry', 'reverse');
      }

      for (let i = 0; i < x.slicedContent.length - 1; i++) {
        if (name === x.slicedContent.at(i)) {
          endEntryAnimation('reverse');
        }
      }
    });
  });
</script>

{#if visibleScreen === name}
  <div bind:this={currentElement} class="screen">
    <slot></slot>
  </div>
{/if}

<style>
  .screen {
    transform: translateX(var(--transformX, 0px)) translateY(var(--transformY, 0px));
    opacity: var(--opacity, 1);
    z-index: var(--zIndex, 1);
    scale: var(--scale, 1);
    width: var(--screen-width, 100%);
    position: absolute;
    overflow-x: hidden;
    overflow-y: hidden;
  }
</style>
