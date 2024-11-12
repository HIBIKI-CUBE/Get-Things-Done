import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/prisma';

export const load: LayoutServerLoad = async ({ locals: { session } }) => {
  const { userId } = session.data;
  if (!userId) {
    return {
      user: undefined,
    };
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session.data.userId,
    },
  });

  return {
    user: user ?? undefined,
  };
};
