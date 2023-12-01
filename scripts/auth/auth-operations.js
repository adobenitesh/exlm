import { JWT } from './session-keys.js';

export let authenticated = false;

export function authenticate (arg = false) {
  authenticated = arg;
}

export function signIn() {
  window.adobeIMS?.signIn(); // eslint-disable-line
}

export function signOut() {
  sessionStorage.removeItem(JWT);
  window.adobeIMS?.signOut(); // eslint-disable-line
}
