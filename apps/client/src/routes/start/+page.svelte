<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation'
	import gameInstance from '$lib/components/game/digda.js';  // 기본 인스턴스 import

	let gameStarted = $state(false)
	let gameState = $state({
		isPlaying: false,
		score: 0,
		moles: [] as Array<{ isVisible: boolean, timeoutId: number | null }>
	})

	// $effect(()=> {
	// 	if(dev) console.log("클라 :",	$state.snapshot(gameState.moles))
	// })


	// 구독 설정 및 해제
    $effect(() => {
        const unsubscribe = gameInstance.subscribe((newState) => {
            // moles 배열의 구조를 유지하면서 복사
            gameState = {
                isPlaying: newState.isPlaying,
                score: newState.score,
                moles: newState.moles.map(isVisible => ({
                    isVisible,
                    timeoutId: null
                }))
            };
            
            if (!newState.isPlaying && gameStarted) {
                gameStarted = false;
            }
        });

        // cleanup 함수 반환
        return unsubscribe;
    });

	const handleWhack = (index) => {
    gameInstance.whackMole(index);
  };

  const handleStart = () => {
		gameStarted = true;
    gameInstance.startGame({
      moleCount: 9,
      gameDuration: 15000,
      moleDuration: 1200,
    });

		const get = gameInstance.getState();
  }



	async function handleLogout() {
		// 서버에 로그아웃 요청
		const response = await fetch('/api/auth/logout', { method: 'POST' })
		if (response.ok) {
			goto('/')
		}
	}

</script>
<button onclick={handleLogout}>로그아웃</button>

<div class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">두더지를 잡아라</h1>
	<div class="mb-4">
		{#if !gameStarted}
			<button 
				class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
				onclick={handleStart}>
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
					onclick={() => handleWhack(index)}>
					{mole.isVisible ? '🐭' : '🕳️'}
				</button>
			{/each}
		</div>
	{:else if gameStarted === false && gameState.score > 0}
		<p class="text-xl font-semibold text-center">게임 종료! 최종 점수: {gameState.score}</p>
	{/if}
</div>
