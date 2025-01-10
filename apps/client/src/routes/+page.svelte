<script>
	import { socket } from '$lib/socket'
	import { onMount } from 'svelte'

	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'

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

<form onsubmit={sendMessage} class="flex max-w-lg mt-10 items-center">
	<Input
		class="w-full"
		bind:value={currentMessage}
		placeholder="Type a message..."
		onkeypress={(e) => e.key === 'Enter'}
	/>
	<Button type="submit">Send</Button>
</form>

<ul>
	{#each returnMessage as message}
		<li>{message}</li>
	{/each}
</ul>
