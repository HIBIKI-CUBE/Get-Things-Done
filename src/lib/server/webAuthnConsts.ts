import { env } from '$env/dynamic/private';

export interface Env {
  RPID: string;
}

export const rpName = 'Get Things Done' as const;
export const rpID = env.RPID ?? 'localhost';
export const origin = rpID === 'localhost'
  ? `http://${rpID}:8787`
  : `https://${rpID}` as const;
