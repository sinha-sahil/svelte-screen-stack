<script lang="ts">
  import { onMount } from 'svelte';
  import state from './state';
  import type { ScreenAnimation, State } from './types';
  import { get } from 'svelte/store';

  export let initialScreen: string;
  export let animation: ScreenAnimation = 'slide';

  export const changeScreen = function (newScreen: string) {
    state.update((x: State) => {
      let slicedContent: string[] = [];
      let newStack = [];

      if (x.stack.includes(newScreen)) {
        newStack = x.stack.slice(0, x.stack.indexOf(newScreen) + 1);
        slicedContent = x.stack.slice(x.stack.indexOf(newScreen) + 1);
      } else {
        newStack = [...x.stack, newScreen];
      }

      return { ...x, stack: newStack, activeScreen: newScreen, slicedContent };
    });
  };

  export const goBack = function () {
    const stack = get(state).stack;
    const penultimateScreen = stack.at(stack.length - 2);
    if (typeof penultimateScreen === 'string') {
      changeScreen(penultimateScreen);
    }
  };

  function setupState() {
    state.update((x: State) => {
      return {
        ...x,
        activeScreen: initialScreen,
        stack: [...x.stack, initialScreen],
        animation
      };
    });
  }

  setupState();
</script>

<div class="screen-container">
  <slot></slot>
</div>

<style>
  .screen-container {
    display: flex;
  }
</style>
