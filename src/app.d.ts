// See https://kit.svelte.dev/docs/types#app

import type { users } from '$lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    interface PageData {
      user: InferSelectModel<typeof users> | undefined;
    }
    // interface PageState {}
    // interface Platform {}
    interface Platform {
      env: Env;
      cf: CfProperties;
      ctx: ExecutionContext;
    }
  }
}

export {};
