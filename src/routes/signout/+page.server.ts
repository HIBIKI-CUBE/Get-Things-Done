import type { Actions } from './$types'
import { signOut } from '$lib/auth'

export const actions: Actions = { default: signOut }
