<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  import { get } from 'svelte/store';
  import { createStackStore, STACK_CONTEXT_KEY } from './state';
  import type { ScreenAnimation, State } from './types';

  let {
    initialScreen = '',
    animation = 'slide',
    children
  }: { initialScreen: string; animation: ScreenAnimation; children?: Snippet } = $props();

  let screenContainer: HTMLDivElement | null = $state(null);

  const stackState = createStackStore();
  setContext(STACK_CONTEXT_KEY, stackState);

  export const changeScreen = function (newScreen: string, scrollToTop: boolean = true) {
    stackState.update((x: State) => {
      let slicedContent: string[] = [];
      let newStack = [];

      if (x.stack.includes(newScreen)) {
        const idx = x.stack.lastIndexOf(newScreen);
        newStack = x.stack.slice(0, idx + 1);
        slicedContent = x.stack.slice(idx + 1);
      } else {
        newStack = [...x.stack, newScreen];
      }

      return { ...x, stack: newStack, activeScreen: newScreen, slicedContent };
    });

    if (screenContainer instanceof HTMLElement && scrollToTop) {
      screenContainer.scrollTo({
        top: 0
      });
    }
  };

  export const goBack = function () {
    const stack = get(stackState).stack;
    const penultimateScreen = stack.at(stack.length - 2);
    if (typeof penultimateScreen === 'string') {
      changeScreen(penultimateScreen);
    }
  };

  function setupState() {
    stackState.update((x: State) => {
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

<div class="screen-container" bind:this={screenContainer}>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .screen-container {
    display: flex;
    height: var(--screen-container-height);
    width: var(--screen-container-width);
    position: relative;
  }
</style>
