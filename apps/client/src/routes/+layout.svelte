<script>
	import '../app.css'
	let { children } = $props()

	import { onMount } from 'svelte'
	import { socket } from '$lib/socket'

	onMount(() => {
		socket.connect()

		socket.on('connect', () => {
			console.log('🧑🏾‍💻 Socket connected')
		})

		socket.on('disconnect', () => {
			console.log('🧑🏾‍💻 Socket disconnected')
		})
		return () => {
			socket.disconnect()
		}
	})
</script>

{@render children()}
