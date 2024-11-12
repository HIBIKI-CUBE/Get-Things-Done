import { dev } from '$app/environment';

export const rpName = 'Get Things Done' as const;
export const rpID = dev ? 'localhost' : 'get-things-done.app' as const;
export const origin = dev ? `http://${rpID}:5173` : `https://${rpID}` as const;
