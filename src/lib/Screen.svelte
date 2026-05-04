<script lang="ts">
  import { Tween } from 'svelte/motion';
  import { STACK_CONTEXT_KEY, type StackStore } from './state';
  import { getEasingFunction, sleep } from './utils';
  import { getContext, onMount, type Snippet } from 'svelte';
  import type { AnimationDirection, AnimationType, Easing, State, Transition } from './types';

  let { name = '', children }: { name: string; children?: Snippet } = $props();

  const stackState = getContext<StackStore>(STACK_CONTEXT_KEY);

  let runExitAnimation: boolean = $state(false);
  let visibleScreen: string | null = $state(null);

  let entryAnimationDuration: number = $state(-1);
  let exitAnimationDuration: number = $state(-1);

  let currentElement: HTMLElement | null = $state(null);

  type TweenState = { fn: Tween<number> } & Easing;

  let entryTweens: TweenState[] = $state([]);
  let exitTweens: TweenState[] = $state([]);

  function getTweenValue(property: Easing['property']) {
    const tweens = runExitAnimation ? exitTweens : entryTweens;
    const tween = tweens.find((t) => t.property === property);
    return tween?.fn.current ?? (property === 'opacity' ? 1 : 0);
  }

  let transformX = $derived(getTweenValue('transformX'));
  let transformY = $derived(getTweenValue('transformY'));
  let opacity = $derived(getTweenValue('opacity'));
  let scale = $derived(getTweenValue('scale'));

  function startEntryAnimation() {
    runExitAnimation = false;

    entryTweens.forEach((tweenSt) => {
      tweenSt.fn.target = tweenSt.to;
    });
  }

  function endEntryAnimation(direction: AnimationDirection = 'forward') {
    entryTweens.forEach((tweenSt) => {
      const multiplier = tweenSt.property.includes('transform') && direction === 'forward' ? -1 : 1;
      tweenSt.fn.target = multiplier * tweenSt.from;
    });
  }

  function startExitAnimation(direction: AnimationDirection = 'forward') {
    runExitAnimation = true;

    exitTweens.forEach((tweenSt) => {
      const multiplier = tweenSt.property.includes('transform') && direction === 'forward' ? -1 : 1;
      tweenSt.fn.target = multiplier * tweenSt.to;
    });
  }

  function endExitAnimation() {
    exitTweens.forEach((tweenSt) => {
      tweenSt.fn.target = tweenSt.from;
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
    const animation = $stackState.animation;

    let easingMethods: Transition | null = null;

    if (typeof animation === 'string') {
      easingMethods = getEasingFunction(animation);
    } else if (animation !== null) {
      easingMethods = animation;
    }

    if (easingMethods !== null) {
      easingMethods.entry.forEach((animation) => {
        const animTween = new Tween(animation.from, {
          duration: animation.duration,
          easing: animation.interpolator
        });
        entryAnimationDuration = Math.max(entryAnimationDuration, animation.duration);
        entryTweens.push({ ...animation, fn: animTween });
      });

      easingMethods.exit.forEach((animation) => {
        const animTween = new Tween(animation.from, {
          duration: animation.duration,
          easing: animation.interpolator
        });
        exitAnimationDuration = Math.max(exitAnimationDuration, animation.duration);
        exitTweens.push({ ...animation, fn: animTween });
      });
    }

    stackState.subscribe(async (x: State) => {
      const isEntry = x.activeScreen == name;
      const stackIndex = x.stack.lastIndexOf(name);
      const slicedStackIndex = x.slicedContent.lastIndexOf(name);
      const isExit = stackIndex !== -1 && stackIndex === x.stack.length - 2;
      const isBack = slicedStackIndex !== -1 && slicedStackIndex === x.slicedContent.length - 1;
      const isRevisit = isEntry && x.slicedContent.length > 0;

      if (isRevisit) {
        visibleScreen = x.activeScreen;
        await startAnimation('entry', 'reverse');
      } else if (isEntry) {
        visibleScreen = x.activeScreen;
        await startAnimation();
      } else if (isExit) {
        await startAnimation('exit');
        visibleScreen = null;
      } else if (isBack) {
        await startAnimation('exit', 'reverse');
        visibleScreen = null;
      }

      for (let i = 0; i < x.slicedContent.length - 1; i++) {
        if (name === x.slicedContent.at(i) && name !== x.activeScreen) {
          endEntryAnimation('reverse');
        }
      }
    });
  });
</script>

{#if visibleScreen === name}
  <div
    bind:this={currentElement}
    class="screen"
    style:transform="translateX({transformX}px) translateY({transformY}px)"
    style:opacity
    style:scale
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
{/if}

<style>
  .screen {
    height: var(--screen-height);
    width: var(--screen-width, 100%);
    position: absolute;
    overflow-x: hidden;
    overflow-y: hidden;
  }
</style>
