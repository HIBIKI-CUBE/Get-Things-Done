import type { Actions } from './$types'
import { signIn } from '$lib/auth'

export const actions: Actions = { default: signIn }
