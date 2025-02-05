import { json } from '@sveltejs/kit'

export const POST = async ({ cookies }) => {
	cookies.delete('auth_token', { path: '/' })
	return json({ success: true })
}
