<script>
	import { onMount } from 'svelte';
	import { io } from 'socket.io-client';

	let socket;
	let currentMessage = $state('');

	onMount(() => {
		socket = io('http://localhost:3000', {
			withCredentials: true,
			transports: ['websocket']
		});

		socket.on('connect', () => {
			console.log('Connected to server');
		});

		socket.on('eventFromServer', (message) => {
			console.log(message);
		});

		socket.on('connect_error', (error) => {
			console.error('Connection error:', error);
		});
		return () => {
			socket?.disconnect();
		};
	});

	function sendMessage() {
		if (currentMessage && socket) {
			socket.emit('eventFromClient', currentMessage);
			currentMessage = ''; // 메시지 전송 후 입력창 초기화
		}
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<input
	bind:value={currentMessage}
	placeholder="Type a message..."
	onkeydown={(e) => e.key === 'Enter' && sendMessage()}
/>
<button onclick={sendMessage}>Send</button>
