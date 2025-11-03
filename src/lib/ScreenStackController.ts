import type { SvelteComponent } from 'svelte';

export class ScreenStackController {
  screenStackRef: SvelteComponent;
  useViewTransition: boolean;

  constructor(screenStackRef: SvelteComponent, useViewTransition: boolean) {
    this.screenStackRef = screenStackRef;
    this.useViewTransition = useViewTransition;
  }

  changeScreen(newScreenName: string, scrollToTop: boolean = true): void {
    this.screenStackRef.changeScreen(newScreenName, scrollToTop);
  }

  goBack(): boolean {
    return this.screenStackRef.goBack();
  }
}
