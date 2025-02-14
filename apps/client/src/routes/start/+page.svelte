<script lang="ts">
	import { dev } from '$app/environment'
	import { goto } from '$app/navigation'
	import gameInstance from '$lib/components/game/digda.js' // 기본 인스턴스 import

	import digda_mole from '$lib/img/digda_mole.png'

	type GameState = {
		isPlaying: boolean
		score: number
		moles: Array<{ isVisible: boolean; timeoutId: number | null }>
	}

	let gameState = $state<GameState>({
		isPlaying: false,
		score: 0,
		moles: []
	})

	// Derived state for UI conditions
	let showStartButton = $derived(!gameState.isPlaying)
	let showGameOver = $derived(!gameState.isPlaying && gameState.score > 0)

	// $effect(()=> {
	// 	if(dev) console.log("클라 :",	$state.snapshot(gameState.moles))
	// })

	// 구독 설정 및 해제
	$effect(() => {
		console.log('effect 실행: 구독 설정')

		const handleStateChange = (newState) => {
			gameState = {
				isPlaying: newState.isPlaying,
				score: newState.score,
				moles: newState.moles.map((isVisible) => ({
					isVisible,
					timeoutId: null
				}))
			}
		}

		const unsubscribe = gameInstance.subscribe(handleStateChange)

		// cleanup 함수
		return unsubscribe
	})

	const handleWhack = (index) => {
		gameInstance.whackMole(index)
	}

	const handleStart = () => {
		gameInstance.startGame({
			moleCount: 9,
			gameDuration: 15000,
			moleDuration: 1200
		})
	}

	async function handleLogout() {
		// 서버에 로그아웃 요청
		const response = await fetch('/api/auth/logout', { method: 'POST' })
		if (response.ok) {
			goto('/')
		}
	}
</script>

<svelte:head>
	<style>
		/* 전역 스타일 적용 */
		body {
			user-select: none;
			-webkit-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
		}
	</style>
</svelte:head>

<button onclick={handleLogout}>로그아웃</button>

<div class="container mx-auto p-4" style="user-select: none; -webkit-user-drag: none;">
	<h1 class="text-2xl font-bold mb-4">두더지를 잡아라</h1>
	<div class="mb-4">
		{#if showStartButton}
			<button
				class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
				onclick={handleStart}
			>
				게임 시작
			</button>
		{/if}
	</div>

	{#if gameState.isPlaying}
		<p class="text-xl font-semibold mb-4">Score: {gameState.score}</p>
		<div class="grid grid-cols-3 gap-3 max-w-[300px] mx-auto">
			{#each gameState.moles as mole, index}
				<button
					class="aspect-square text-3xl bg-gray-600 hover:bg-gray-700 active:scale-95 rounded-lg transition-all duration-100 ease-in-out"
					onclick={() => handleWhack(index)}
					draggable="false"
				>
					{#if mole.isVisible}
						<img src={digda_mole} alt="digda" class="w-full h-full" draggable="false" />
					{:else}
						🕳️
					{/if}
				</button>
			{/each}
		</div>
	{:else if showGameOver}
		<p class="text-xl font-semibold text-center">게임 종료! 최종 점수: {gameState.score}</p>
	{/if}
</div>
