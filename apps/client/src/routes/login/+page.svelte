<script>
	import { socket } from '$lib/socket'

	// import { WebAuthnClient } from '@edgedb/auth-core/webauthn'

	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'
	import { createCredentials, encodeAssertion, getAssertion, SetEncodeCredentials } from './signUp'
	import { dev } from '$app/environment'

	// const webAuthnClient = new WebAuthnClient({
	// 	signupOptionsUrl: 'http://localhost:3000/auth/webauthn/register/options',
	// 	signupUrl: 'http://localhost:3000/auth/webauthn/register',
	// 	signinOptionsUrl: 'http://localhost:3000/auth/webauthn/authenticate/options',
	// 	signinUrl: 'http://localhost:3000/auth/webauthn/authenticate',
	// 	verifyUrl: 'http://localhost:3000/auth/webauthn/verify'
	// })

	let email = ''
	let errorMessage = ''

	// const signUp = async () => {
	// 	if (!email) {
	// 		errorMessage = 'No email provided'
	// 		return
	// 	}
	// 	try {
	// 		console.log('회원가입', email)
	// 		await webAuthnClient.signUp(email.trim())
	// 		// window.location = 'http://localhost:3000/signup-success'
	// 	} catch (err) {
	// 		console.error(err)
	// 		// window.location = 'http://localhost:3000/signup-error'
	// 	}
	// }

	// 	const signUp = async () => {
	// 		if (!email) {
	// 			errorMessage = 'No email provided'
	// 			return
	// 		}
	// 		// 1. register options 요청

	// 		socket.emit('webauthn:register:options', { email })

	// 		socket.on('webauthn:register:options:response', async (options) => {
	// 			// WebAuthn 등록 처리
	// // 2. userHandle 생성
	// 			const userHandle = options.user.id;
	// //3. credentials 생성
	// 			const credentials = await createCredentials(options, userHandle)

	// 			if (!credentials) {
	//             throw new Error("Failed to create credentials");
	//         }

	// 				// 4. credentials encoded
	// 				const encodedCredentials = SetEncodeCredentials(credentials)

	// 				// 5. 만들어진 credentials를 data로 회원가입 등록
	// 				socket.emit('webauthn:register', {
	//       email,
	//       credentials: encodedCredentials,
	//       provider: 'webauthn',
	//       verify_url: 'http://localhost:3000/auth/webauthn/verify',
	//       user_handle: userHandle
	//     })

	// 		socket.on('webauthn:register:response', (response) => {
	// 			console.log('WebAuthn response:사용자등록성공!', response)

	// 		})
	// 		return () => {
	// 			socket.off('webauthn:register:response', () => {
	// 				console.log(' WebAuthn response:사용자등록성공! and off')
	// 			})
	//         socket.off('webauthn:register:options:response', () => {
	// 						console.log('WebAuthn response:사용자등록성공! and off')
	// 				});
	//     };

	// 	})

	// 		// socket.emit('webauthn:register', { email, credential: options })

	// 		socket.on('webauthn:error', (error) => {
	// 			console.error('WebAuthn error:', error)
	// 		})
	// 	}

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
					// socket.off('webauthn:authenticate:options:response', handleOptions)
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
					console.log('response :>> ', response)
					socket.off('webauthn:authenticate:response', handleAuthenticate)
					if (dev) console.log('webauthn:authenticate:response : socket off ')
					resolve(response)
				}

				socket.on('webauthn:authenticate:response', handleAuthenticate)
				socket.emit('webauthn:authenticate', {
					email,
					assertion: encodedAssertion,
					verify_url: 'http://localhost:3000/auth/webauthn/verify',
					provider: 'webauthn',
				})
			})

			console.log('WebAuthn response: 사용자로그인성공!', response)
		} catch (error) {
			socket.on('webauthn:error', (error) => {
				console.error('WebAuthn error:', error)
			})
		}

		// try {
		// 	await webAuthnClient.signIn(email)
		// 	window.location = 'http://localhost:3000'
		// } catch (err) {
		// 	console.error(err)
		// 	window.location = 'http://localhost:3000/signup-error'
		// }
	}

	// const signIn = async () => {
	// 	if (!email) {
	// 		errorMessage = 'No email provided'
	// 		return
	// 	}
	// 	try {
	// await webAuthnClient.signIn(email)
	// 		window.location = 'http://localhost:3000'
	// 	} catch (err) {
	// 		console.error(err)
	// 		window.location = 'http://localhost:3000/signup-error'
	// 	}
	// }

	const test = async (params) => {
		const res = await fetch('http://localhost:3000/auth/webauthn/register/options', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email: 'lhdf@naver.com' })
		})

		const result = await res.text()
		console.log(result)
	}
</script>

<main>
	<h1>WebAuthn Authentication</h1>
	<Input type="email" bind:value={email} placeholder="Enter your email" />
	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}
	<Button on:click={signUp}>Sign Up</Button>
	<Button on:click={signIn}>Sign In</Button>
	<Button on:click={test}>Test</Button>
</main>

<style>
	.error {
		color: red;
	}
</style>
