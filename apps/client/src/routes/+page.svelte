<script>
	import { socket } from '$lib/socket'
	import { onMount } from 'svelte'

	let currentMessage = $state('') // 입력창에 입력된 메시지를 저장할 변수

	let returnMessage = $state(['']) // 서버로부터 받은 메시지를 저장할 변수

	onMount(() => {
		socket.connect()

		socket.on('connect', () => {
			console.log('🧑🏾‍💻 Socket connected')
		})

		socket.on('disconnect', () => {
			console.log('🧑🏾‍💻 Socket disconnected')
		})

		if (!socket.isConnected) {
			return console.log('🧑🏾‍💻 Socket is not connected')
		}
		const unsubscribe = socket.on('eventFromServer', (message) => {
			// 불변성을 유지하면서 배열 업데이트
			returnMessage = [...returnMessage, message]
		})

		return () => unsubscribe()
	})

	function sendMessage() {
		if (currentMessage.trim()) {
			socket.emit('eventFromClient', currentMessage)
			currentMessage = ''
		}
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<form onsubmit={sendMessage}>
	<input
		bind:value={currentMessage}
		placeholder="Type a message..."
		onkeypress={(e) => e.key === 'Enter'}
	/>
	<button type="submit">Send</button>
</form>

<ul>
	{#each returnMessage as message}
		<li>{message}</li>
	{/each}
</ul>
