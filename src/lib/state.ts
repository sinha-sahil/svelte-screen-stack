import { writable } from 'svelte/store';
import type { State } from './types';

const state = writable<State>({
  activeScreen: null,
  stack: [],
  slicedContent: [],
  animation: 'slide'
});

export default state;
