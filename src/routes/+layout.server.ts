import type { LayoutServerLoad } from './$types'
import { prisma } from '$lib/prisma';

export const load: LayoutServerLoad = async ({ locals: { session } }) => {
  const user = (await prisma.session.findUnique({
    where: {
      id: session.id,
    },
    include: {
      User: true,
    },
  }))?.User;

  return {
    user: user ?? undefined,
  };
};
