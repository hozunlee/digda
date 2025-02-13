<script lang="ts">
	import { goto } from '$app/navigation'


	import createMoleGame from '$lib/components/game/digda.js';


	let gameStarted = $state(false)
	let gameState = $state({
		isPlaying: false,
		score: 0,
		moles: []
	})

	$effect(()=> {
		console.log("클라 :",	$state.snapshot(gameState.moles))
	})


$effect(() => {
	const handleStateChange = (newState) => {
		gameState = {...newState};
  
      // 게임 종료 여부 확인
      if (!newState.isPlaying) {
        console.log("Game Over!");
        gameStarted = false;
      }

    // 상태 변화를 확인하기 위해 subscribe
    createMoleGame.subscribe(handleStateChange);
  
    return () => {
      createMoleGame.subscribe(() => {}); // cleanup
    };
  }});


	const handleWhack = (index) => {
    createMoleGame.whack(index);
  };

  const handleStart = () => {
		gameStarted = true;
    createMoleGame.startGame({
      moleCount: 6,
      gameDuration: 15000,
      moleDuration: 1200,
    });

		const get = createMoleGame.getState();
		console.log('get :>> ', get);
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
	<h1>두더지를 잡아라</h1>
	<div>
		{#if !gameStarted}
			<button onclick={handleStart}>게임 시작</button>
		{/if}
	</div>
{#if !gameState.isPlaying}
<p>Score: {gameState.score}</p>
<div>
	{#each gameState.moles as isMoleVisible, index}
	<button  onclick={() => handleWhack(index)}>{isMoleVisible ? '🐭' : '🕳️'}</button>
{/each}
</div>

{:else}
바이
{/if}

</div>
