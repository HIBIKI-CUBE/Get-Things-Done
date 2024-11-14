import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export interface Env {
  RPID: string;
}

export const rpName = 'Get Things Done' as const;
export const rpID = dev ? 'localhost' : env.RPID;
export const origin = dev ? `http://${rpID}:5173` : `https://${rpID}` as const;
