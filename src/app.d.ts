// See https://kit.svelte.dev/docs/types#app

import type { User } from '@prisma/client';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    interface PageData {
      user: User | undefined;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
