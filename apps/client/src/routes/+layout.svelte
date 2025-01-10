<script>
	import '../app.css'
	let { children } = $props()

	import { onDestroy } from 'svelte'
	import { socket } from '$lib/socket'

	onDestroy(() => {
		socket.disconnect()
	})
</script>

{@render children()}
