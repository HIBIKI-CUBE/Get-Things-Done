import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals: { session } }) => {
  session.cookie.path = '/';
  await session.setData({ });
  await session.save();

  return json({ });
};
