<script>
	import { socket } from '$lib/socket'

	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'

	let isConnected = $state(false)

	let currentMessage = $state('') // 입력창에 입력된 메시지를 저장할 변수
	let returnMessage = $state(['']) // 서버로부터 받은 메시지를 저장할 변수

	// 소켓 연결 상태 구독
	$effect(() => {
		const unsubscribe = socket.isConnected.subscribe((connected) => {
			isConnected = connected

			if (connected) {
				// 소켓이 연결되면 이벤트 리스너 등록
				const messageUnsubscribe = socket.on('eventFromServer', (message) => {
					returnMessage = [...returnMessage, message]
				})

				return () => messageUnsubscribe()
			}
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
<a href="/login"><Button class="mt-4">로그인</Button> </a>
<ul>
	{#each returnMessage as message}
		<li>{message}</li>
	{/each}
</ul>
