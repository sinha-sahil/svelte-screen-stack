import { writable, type Writable } from 'svelte/store';
import type { State } from './types';

export type StackStore = Writable<State>;

export const STACK_CONTEXT_KEY = Symbol('svelte-screen-stack');

export function createStackStore(): StackStore {
  return writable<State>({
    activeScreen: null,
    stack: [],
    slicedContent: [],
    animation: 'slide'
  });
}
