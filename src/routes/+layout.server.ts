import type { LayoutServerLoad } from './$types';
import { db } from '$lib/drizzle';

export const load: LayoutServerLoad = async ({ locals: { session } }) => {
  const { userId } = session.data;
  if (!userId) {
    return {
      user: undefined,
    };
  }

  const user = await db.query.users.findFirst({
    where: ({ id }, { eq }) => eq(id, userId),
  });

  return { user };
};
