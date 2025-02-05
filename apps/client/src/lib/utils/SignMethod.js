// Base64URL to Uint8Array
function base64UrlToBytes(base64url) {
	const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
	const padLen = (4 - (base64.length % 4)) % 4
	const padded = base64 + '='.repeat(padLen)
	const binary = atob(padded)
	const bytes = new Uint8Array(binary.length)

	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i)
	}
	return bytes
}

// Uint8Array to Base64URL
function bytesToBase64Url(bytes) {
	const binary = String.fromCharCode(...bytes)
	const base64 = btoa(binary)
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function createCredentials(options, userHandle) {
	return navigator.credentials.create({
		publicKey: {
			...options,
			challenge: base64UrlToBytes(options.challenge),
			user: {
				...options.user,
				id: base64UrlToBytes(userHandle)
			},
			excludeCredentials: options.excludeCredentials?.map((cred) => ({
				...cred,
				id: base64UrlToBytes(cred.id)
			}))
		}
	})
}

export function SetEncodeCredentials(credentials) {
	const { response } = credentials
	return {
		authenticatorAttachment: credentials.authenticatorAttachment,
		clientExtensionResults: credentials.getClientExtensionResults(),
		id: credentials.id,
		rawId: bytesToBase64Url(new Uint8Array(credentials.rawId)),
		response: {
			attestationObject: bytesToBase64Url(new Uint8Array(response.attestationObject)),
			clientDataJSON: bytesToBase64Url(new Uint8Array(response.clientDataJSON))
		},
		type: credentials.type
	}
}

// sign in fuction

export async function getAssertion(options) {
	try {
		const publicKeyCredential = await navigator.credentials.get({
			publicKey: {
				...options,
				challenge: base64UrlToBytes(options.challenge),
				allowCredentials: options.allowCredentials?.map((credential) => ({
					...credential,
					id: base64UrlToBytes(credential.id)
				}))
			}
		})

		if (!publicKeyCredential) {
			throw new Error('인증 실패: 크리덴셜을 가져올 수 없습니다.')
		}

		return publicKeyCredential
	} catch (error) {
		console.error('Assertion error:', error)
		throw new Error(`인증 실패: ${error.message}`)
	}
}

export function encodeAssertion(assertion) {
	const { response: assertionResponse } = assertion

	return {
		type: assertion.type,
		id: assertion.id,
		authenticatorAttachments: assertion.authenticatorAttachment,
		clientExtensionResults: assertion.getClientExtensionResults(),
		rawId: bytesToBase64Url(new Uint8Array(assertion.rawId)),
		response: {
			authenticatorData: bytesToBase64Url(new Uint8Array(assertionResponse.authenticatorData)),
			clientDataJSON: bytesToBase64Url(new Uint8Array(assertionResponse.clientDataJSON)),
			signature: bytesToBase64Url(new Uint8Array(assertionResponse.signature)),
			userHandle: assertionResponse.userHandle
				? bytesToBase64Url(new Uint8Array(assertionResponse.userHandle))
				: null
		}
	}
}
