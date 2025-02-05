<script>
	import { socket } from '$lib/socket'

	import LoaderCircle from 'lucide-svelte/icons/loader-circle'

	import { Button } from '$lib/components/ui/button'
	import { Input } from '$lib/components/ui/input'

	import MainDigda from '$lib/img/main_dig.jpg?enhanced'
	import Login from '$lib/components/Login.svelte'

	let isConnected = $state(false)

	let currentMessage = $state('') // 입력창에 입력된 메시지를 저장할 변수
	let returnMessage = $state(['']) // 서버로부터 받은 메시지를 저장할 변수

	let isSignIn = $state(true)
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

	// $effect(() => {
	// 	console.log('isConnected :>> ', isConnected)
	// })
</script>

<!-- <form onsubmit={sendMessage} class="flex max-w-lg mt-10 items-center">
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
</ul> -->

{#if !isConnected}
	<div class="flex flex-col items-center justify-center h-screen">
		<div class="my-10">
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin text-yellow-500" />
		</div>
		<p>디그다 디그다</p>
		<p>잠시만 기다려주세요.</p>
	</div>
{:else}
	<!-- <div class="md:hidden">
	<enhanced:img src={MainDigda} alt="Authentication" class="block dark:hidden"></enhanced:img>
</div> -->
	<div
		class="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
	>
		<Button
			on:click={() => (isSignIn = !isSignIn)}
			variant="ghost"
			class="absolute right-4 top-4 md:right-8 md:top-8"
		>
			{isSignIn ? '회원가입하기' : '로그인하기'}
		</Button>
		<div class="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
			<!-- <div
			class="absolute inset-0 bg-cover"
			style="
				background-image:
					url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80);"
		></div> -->
			<div class="relative z-20 flex items-center text-lg font-medium text-gray-400">
				dig:hojunLee
			</div>
			<enhanced:img src={MainDigda} alt="Authentication" class="block dark:hidden"></enhanced:img>

			<div class="relative z-20 mt-auto">
				<blockquote class="space-y-2">
					<p class="text-lg">
						&ldquo;This library has saved me countless hours of work and helped me deliver stunning
						designs to my clients faster than ever before. Highly recommended!&rdquo;
					</p>
					<footer class="text-sm">Sofia Davis</footer>
				</blockquote>
			</div>
		</div>
		<div class="lg:p-8">
			<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div class="flex flex-col space-y-2 text-center">
					<div class="text-2xl lg:text-3xl">본격!</div>
					<h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
						디그다를 잡아라
					</h1>
					<div>
						<Login {isSignIn} />
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
