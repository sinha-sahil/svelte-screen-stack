<script lang="ts">
  import { ScreenStackController } from '$lib/ScreenStackController';
  import { ScreenStack, type ScreenAnimation } from '$lib/index';
  import Screen from '$lib/Screen.svelte';
  import { onMount, type SvelteComponent } from 'svelte';
  import { cubicBezier } from '$lib/utils';

  let screenController: ScreenStackController;

  let screenStack: SvelteComponent;

  let animation: ScreenAnimation = {
    entry: [
      {
        property: 'transformX',
        duration: 300,
        interpolator: cubicBezier(0.52, 0.85, 0.54, 0.91),
        from: window.screen.width,
        to: 0
      },
      {
        property: 'scale',
        duration: 300,
        interpolator: cubicBezier(0.52, 0.85, 0.54, 0.91),
        from: 0.8,
        to: 1
      }
    ],
    exit: [
      {
        property: 'transformX',
        duration: 300,
        interpolator: cubicBezier(1, 0.06, 0.96, 0.32),
        from: 0,
        to: window.screen.height
      },
      {
        property: 'scale',
        duration: 300,
        interpolator: cubicBezier(0.52, 0.85, 0.54, 0.91),
        from: 1,
        to: 0.8
      }
    ]
  };

  let runAuto = false;

  onMount(async () => {
    screenController = new ScreenStackController(screenStack, true);

    while (runAuto) {
      for (let i = 1; i < 4; i++) {
        await screenController.changeScreen(i.toString());
        await new Promise((resolve) => setTimeout(resolve, 4000));
        if (i == 3) {
          i = 0;
        }
      }
    }
  });
</script>

<div class="screen-content-wrap">
  <ScreenStack initialScreen="1" bind:this={screenStack} {animation}>
    <Screen name="1">
      <div class="screen-content one">
        <h1>Screen One</h1>
      </div>
    </Screen>

    <Screen name="2">
      <div class="screen-content two">
        <h1>Screen Two</h1>
      </div>
    </Screen>

    <Screen name="3">
      <div class="screen-content three">
        <h1>Screen Three</h1>
      </div>
    </Screen>
  </ScreenStack>
</div>

<div style="height: 24px;"></div>

<button on:click={() => screenController.changeScreen('1')}>Screen 1</button>
<button on:click={() => screenController.changeScreen('2')}>Screen 2</button>
<button on:click={() => screenController.changeScreen('3')}>Screen 3</button>
<button on:click={() => screenController.goBack()}>GoBack</button>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

  .screen-content-wrap {
    min-height: 75vh;
    width: 100vw;
  }

  .screen-content {
    height: 75vh;
    width: 100vw;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Montserrat', sans-serif;
  }

  .one {
    background-color: rgb(54, 143, 222);
  }

  .two {
    background-color: rgb(14, 131, 76);
  }

  .three {
    background-color: rgb(222, 54, 143);
  }

  button {
    margin: 10px;
    padding: 10px;
    font-size: 1.2em;
    font-family: 'Montserrat', sans-serif;
    background-color: rgb(54, 143, 222);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
</style>
