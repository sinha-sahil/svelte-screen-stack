# Svelte Screen Stack

A library which helps you handle create easy and smooth transitions during navigation between screens and provides utils to manage screen stack management.

## Installation

In order to install run the following command

```bash
npm i svelte-screen-stack
```

## Usage

In order to start using Svelte Screen Stack, you need to following:

1. [Creating a ScreenStack](#creating-a-screenstack)

- [Importing](#importing)
- [Props](#props)
- [Controlling](#controlling)

### [✨ Jump to Example ✨](#example)

---

### Creating a ScreenStack

#### Importing

```typescript
import { ScreenStack } from 'svelte-screen-stack';
```

#### Props

The ScreenStack takes following parameters:

| Prop Name     | Type              | Description                                             | Default Value |
| ------------- | ----------------- | ------------------------------------------------------- | ------------- |
| initialScreen | `string`          | The name of the screen to display at the beginning      | (required)    |
| animation     | `ScreenAnimation` | The animation to use when transitioning between screens | `'slide'`     |

The `ScreenAnimation` type can be either a string preset (`'slide'`) or a custom animation object with the following structure:

```typescript
type ScreenAnimation =
  | 'slide'
  | {
      entry: Array<{
        property: string; // CSS property to animate (e.g., 'transformX', 'scale', 'opacity')
        duration: number; // Duration of the animation in milliseconds
        interpolator: Function; // Easing function for the animation
        from: number; // Starting value
        to: number; // Ending value
      }>;
      exit: Array<{
        property: string;
        duration: number;
        interpolator: Function;
        from: number;
        to: number;
      }>;
    };
```

You can use the built-in `cubicBezier` utility function to create custom interpolators:

```typescript
import { cubicBezier } from 'svelte-screen-stack';

const customAnimation = {
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
      to: window.screen.width
    }
  ]
};
```

#### Invocation

To use the ScreenStack component in your Svelte application:

1. Import the necessary components:

```svelte
import {(ScreenStack, Screen, ScreenStackController, cubicBezier)} from 'svelte-screen-stack';
```

2. Create a reference to the ScreenStack and define animation if needed:

```svelte
<script>
  import { onMount, type SvelteComponent } from 'svelte';

  let screenStack: SvelteComponent;

  // Optional: Define custom animation
  let animation = {
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
</script>
```

3. Create the ScreenStack in your markup with Screen components:

```svelte
<ScreenStack initialScreen="1" bind:this={screenStack} {animation}>
  <Screen name="1">
    <div class="screen-content">
      <h1>Screen One</h1>
    </div>
  </Screen>

  <Screen name="2">
    <div class="screen-content">
      <h1>Screen Two</h1>
    </div>
  </Screen>

  <Screen name="3">
    <div class="screen-content">
      <h1>Screen Three</h1>
    </div>
  </Screen>
</ScreenStack>
```

4. Initialize the ScreenStackController to control navigation:

```svelte
<script>
  let screenController: ScreenStackController;

  onMount(() => {
    screenController = new ScreenStackController(screenStack, true);
  });
</script>
```

### Controlling ScreenStack Navigation

The `ScreenStackController` class provides methods to control screen navigation:

| Method         | Parameters           | Description                                        |
| -------------- | -------------------- | -------------------------------------------------- |
| `changeScreen` | `screenName: string` | Navigates to the specified screen                  |
| `goBack`       | None                 | Navigates back to the previous screen in the stack |

---

## Example

Here's a complete functional example of implementing a screen stack with custom animations:

```svelte
<script lang="ts">
  import {
    ScreenStackController,
    ScreenStack,
    type ScreenAnimation,
    Screen,
    cubicBezier
  } from 'svelte-screen-stack';
  import { onMount, type SvelteComponent } from 'svelte';

  // Create references for screen stack and controller
  let screenController: ScreenStackController;
  let screenStack: SvelteComponent;

  // Define custom animations
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
        to: window.screen.width
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

  onMount(() => {
    // Initialize the screen controller
    screenController = new ScreenStackController(screenStack, true);
  });
</script>

<!-- Screen stack container -->
<div class="screen-container">
  <ScreenStack initialScreen="dashboard" bind:this={screenStack} {animation}>
    <!-- Dashboard Screen -->
    <Screen name="dashboard">
      <div class="screen-content dashboard">
        <h1>Dashboard</h1>
        <p>Welcome to your application dashboard!</p>
        <button on:click={() => screenController.changeScreen('profile')}> View Profile </button>
        <button on:click={() => screenController.changeScreen('settings')}> Settings </button>
      </div>
    </Screen>

    <!-- Profile Screen -->
    <Screen name="profile">
      <div class="screen-content profile">
        <h1>User Profile</h1>
        <div class="profile-info">
          <div class="avatar">👤</div>
          <h2>John Doe</h2>
          <p>john.doe@example.com</p>
        </div>
        <button on:click={() => screenController.goBack()}> Back to Dashboard </button>
      </div>
    </Screen>

    <!-- Settings Screen -->
    <Screen name="settings">
      <div class="screen-content settings">
        <h1>Settings</h1>
        <div class="settings-options">
          <div class="setting-item">
            <span>Dark Mode</span>
            <input type="checkbox" />
          </div>
          <div class="setting-item">
            <span>Notifications</span>
            <input type="checkbox" checked />
          </div>
          <div class="setting-item">
            <span>Sound</span>
            <input type="checkbox" />
          </div>
        </div>
        <button on:click={() => screenController.goBack()}> Save and Go Back </button>
      </div>
    </Screen>
  </ScreenStack>
</div>

<!-- Navigation controls -->
<div class="navigation-bar">
  <button on:click={() => screenController.changeScreen('dashboard')}>Dashboard</button>
  <button on:click={() => screenController.changeScreen('profile')}>Profile</button>
  <button on:click={() => screenController.changeScreen('settings')}>Settings</button>
  <button on:click={() => screenController.goBack()}>Back</button>
</div>

<style>
  .screen-container {
    width: 100%;
    height: 80vh;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }

  .screen-content {
    height: 100%;
    width: 100%;
    padding: 20px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .dashboard {
    background-color: #3498db;
  }

  .profile {
    background-color: #2ecc71;
  }

  .settings {
    background-color: #9b59b6;
  }

  .profile-info {
    margin: 20px 0;
  }

  .avatar {
    font-size: 4em;
    margin-bottom: 10px;
  }

  .settings-options {
    width: 80%;
    max-width: 300px;
    margin: 20px 0;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .navigation-bar {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  button {
    padding: 10px 20px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
  }

  button:hover {
    background-color: #555;
  }
</style>
```

This example creates a simple app with three screens: Dashboard, Profile, and Settings. Users can navigate between screens using either the navigation bar or buttons within each screen. The transitions between screens are animated with custom animations defined in the `animation` object.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue to improve this library.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how to contribute.
