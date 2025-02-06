import { redirect } from '@sveltejs/kit'

// 공개 접근 가능한 경로
const PUBLIC_PATHS = ['/', '/about']

// 서버 사이드 렌더링 전에 실행되는 훅

export const handle = async ({ event, resolve }) => {
	const token = event.cookies.get('auth_token')
	const path = event.url.pathname

	// 비공개 경로에 대한 인증 검사
	if (!PUBLIC_PATHS.includes(path) && !token) {
		throw redirect(302, '/')
	}

	// 응답에 인증 상태 추가
	const response = await resolve(event)
	return response
}
