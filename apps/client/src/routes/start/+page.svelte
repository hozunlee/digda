<script lang="ts">
	import { goto } from '$app/navigation'

	async function handleLogout() {
		// 서버에 로그아웃 요청
		const response = await fetch('/api/auth/logout', { method: 'POST' })
		if (response.ok) {
			goto('/')
		}
	}
</script>

<div class="container mx-auto p-4">
	<h1>Start Page</h1>
	<button on:click={handleLogout}>로그아웃</button>
</div>
