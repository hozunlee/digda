<script>
	import { socket } from '$lib/socket'

	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import {
		createCredentials,
		encodeAssertion,
		getAssertion,
		SetEncodeCredentials
	} from '$lib/utils/SignMethod.js'
	import { dev } from '$app/environment'

	let email = ''
	let errorMessage = ''

	export let isSignIn = true

	const signUp = async () => {
		if (!email) {
			errorMessage = 'No email provided'
			return
		}

		try {
			// 1. 옵션 요청 및 응답 처리
			const options = await new Promise((resolve, reject) => {
				const handleOptions = (options) => {
					socket.off('webauthn:register:options:response', handleOptions)
					if (dev) console.log('webauthn:register:options:response : socket off ')
					resolve(options)
				}

				socket.on('webauthn:register:options:response', handleOptions)
				socket.emit('webauthn:register:options', { email })
			})

			// 2. 크리덴셜 생성
			const userHandle = options.user.id
			const credentials = await createCredentials(options, userHandle)
			const encodedCredentials = SetEncodeCredentials(credentials)

			// 3. 등록 요청 및 응답 처리
			const response = await new Promise((resolve, reject) => {
				const handleRegister = (response) => {
					socket.off('webauthn:register:response', handleRegister)
					if (dev) console.log('webauthn:register:response : socket off ')
					resolve(response)
				}

				socket.on('webauthn:register:response', handleRegister)
				socket.emit('webauthn:register', {
					email,
					credentials: encodedCredentials,
					provider: 'webauthn',
					verify_url: 'http://localhost:3000/auth/webauthn/verify',
					user_handle: userHandle
				})
			})

			console.log('WebAuthn response: 사용자등록성공!', response)
		} catch (error) {
			console.error('Registration error:', error)
			errorMessage = error.message
		}
	}

	const signIn = async () => {
		if (!email) {
			errorMessage = 'No email provided'
			return
		}

		try {
			const options = await new Promise((resolve, reject) => {
				const handleOptions = (options) => {
					socket.off('webauthn:authenticate:options:response', handleOptions)
					if (dev) console.log('webauthn:authenticate:options:response : socket off ')
					resolve(options)
				}

				socket.emit('webauthn:authenticate:options', { email })
				socket.on('webauthn:authenticate:options:response', handleOptions)
			})

			// 2. assertion 생성
			const assertion = await getAssertion(options)

			if (!assertion) {
				throw new Error('Failed to sign in')
			}
			const encodedAssertion = encodeAssertion(assertion)

			// 3. 로그인 요청 및 응답 처리
			const response = await new Promise((resolve) => {
				const handleAuthenticate = (response) => {
					socket.off('webauthn:authenticate:response', handleAuthenticate)
					if (dev) console.log('webauthn:authenticate:response : socket off ')
					resolve(response)
				}

				socket.on('webauthn:authenticate:response', handleAuthenticate)
				socket.emit('webauthn:authenticate', {
					email,
					assertion: encodedAssertion,
					verify_url: 'http://localhost:3000/auth/webauthn/verify',
					provider: 'webauthn'
				})
			})

			console.log('WebAuthn response: 사용자로그인성공!', response)
		} catch (error) {
			socket.on('webauthn:error', (error) => {
				console.error('WebAuthn error:', error)
			})
		}
	}
</script>

<figure class="my-5">
	<h2 class="text-xl font-semibold tracking-tight">Sign your account</h2>
	<p class="text-muted-foreground text-sm mt-2">Enter your email below to sign your account</p>
	<Input type="email" bind:value={email} placeholder="Enter your email" class="mt-5 mb-3" />

	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}
	<div class="my-3">
		{#if isSignIn}
			<Button class="w-full" on:click={signIn}>로그인</Button>
		{:else}
			<Button class="w-full" on:click={signUp}>회원가입</Button>
		{/if}
	</div>

	<p class="text-muted-foreground px-8 text-center text-sm mt-8">
		authenticate By webAuthn, you visit to our
		<a
			target="_blank"
			href="https://hololog.dev/series/%EB%94%94%EA%B7%B8%EB%8B%A4%20%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8B%89%EB%8B%88%EB%8B%A4./"
			class="hover:text-primary underline underline-offset-4"
		>
			Tech Blog
		</a>
		and
		<a
			target="_blank"
			href="https://github.com/hozunlee/digda"
			class="hover:text-primary underline underline-offset-4"
		>
			github:digda
		</a>
		.
	</p>
</figure>

<style>
	.error {
		color: red;
	}
</style>
