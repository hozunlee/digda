/**
 * MoleGame 모듈 - 함수형 패턴으로 구현
 *
 * @module MoleGame
 */

/**
 * @typedef {Object} Settings
 * @property {number} moleCount - 두더지 수
 * @property {number} gameDuration - 게임 전체 시간 (ms)
 * @property {number} moleDuration - 각 두더지가 나타나는 시간 (ms)
 */

/**
 * @typedef {Object} Mole
 * @property {boolean} isVisible - 두더지의 표시 여부
 * @property {number | null} timeoutId - 두더지 타이머 ID
 */

/**
 * @typedef {Object} GameState
 * @property {boolean} isPlaying - 게임 진행 여부
 * @property {number} score - 점수
 * @property {boolean[]} moles - 두더지 상태 배열
 */

/**
 * @typedef {Function} SubscriberCallback
 * @param {GameState} state - 현재 게임 상태
 */

/**
 * MoleGame 팩토리 함수
 *
 * @param {Settings} [customSettings={}] - 사용자 정의 설정. Default is `{}`
 * @returns {Object} MoleGame 인스턴스
 */

const createMoleGame = ((customSettings = {}) => {
	/**
	 * 기본 게임 설정
	 *
	 * @type {Settings}
	 */
	const defaultSettings = {
		moleCount: 5, // 두더지 수
		gameDuration: 10000, // 게임 전체 시간 (ms)
		moleDuration: 1000 // 각 두더지가 나타나는 시간 (ms)
	}

	/** @type {Settings} */
	let settings = { ...defaultSettings, ...customSettings }

	/** @type {Mole[]} */
	let moles = [] // 두더지 상태 배열

	/** @type {number | null} */
	let gameTimer = null

	let moleTimeouts = [] // 각 두더지 타이머

	/** @type {boolean} */
	let isPlaying = false // 게임 진행 여부

	/** @type {number} */
	let score = 0 // 점수

	// 게임 상태를 변화를 알리기 위한 함수 목록
	/** @type {SubscriberCallback[]} */
	const subscribers = []

	// 상태 변화를 알리기 위한 콜백 함수
	const subscribe = (callback) => {
		subscribers.push(callback)
	}

	// 현재 상태 변경 알림
	const notifySubscribers = () => {
		const state = getState() // 현재 상태 가져오기
		console.log('상태확인: ', state)
		subscribers.forEach((callback) => callback(state))
	}

	// 두더지 상태 초기화
	const initMoles = () => {
		// 두더지 배열 초기화(false: 숨김, true: 나타남)
		moles = Array.from({ length: defaultSettings.moleCount }, () => false)
	}

	// 랜덤한 두더지 나타나기
	const showMole = () => {
		if (!isPlaying) return

		// TODO: 2인이 함께할 경우 나오는 두더지 위치 동기화 필요!
		const randomIndex = Math.floor(Math.random() * defaultSettings.moleCount)
		console.log('🚀 ~ showMole ~ randomIndex:', randomIndex)

		// 현재 해당 위치에 두더지 false(숨김)이면 나타남
		if (!moles[randomIndex]) {
			moles[randomIndex] = true
			console.log(`${randomIndex}번째 두더지가 나타났다!`)

			notifySubscribers() // 상태 변경 알림

			// 일정 시간이 지나면 두더지를 숨김
			const timeout = setTimeout(() => hide(randomIndex), defaultSettings.moleDuration)
			moleTimeouts[randomIndex] = timeout
		}
	}

	// 두더지 숨기기
	const hide = (index) => {
		// 현재 해당 위치에 두더지 true(나타남)이면 숨김
		if (moles[index]) {
			moles[index] = false
			console.log(`${index}번째 두더지가 사라졌다!`)
		}

		notifySubscribers() // 상태 변경 알림

		// 게임 진행중일 경우, 새로운 두더지 표시
		if (isPlaying) showMole()
	}

	// 두더지 잡기
	const whack = (index) => {
		// 게임이 끝났거나 두더지가 없을 경우
		if (!isPlaying || !moles[index]) return false

		console.log(`${index}번째 두더지를 잡았다!`)
		score++
		moles[index] = false // 두더지를 잡으면 숨김

		// 기존 타이머 제거
		clearTimeout(moleTimeouts[index])
		moleTimeouts[index] = null

		notifySubscribers() // 상태 변경 알림

		// 새로운 두더지 표시
		if (isPlaying) showMole()
		return true
	}

	// 게임 시작
	const startGame = (customSettings = {}) => {
		console.log('dig module : startGame')
		if (isPlaying) return

		isPlaying = true // 게임 시작 상태로 전환
		score = 0
		settings = { ...settings, ...customSettings } // 사용자 환경 설정 반영
		initMoles() // 설정에 맞게 두더지 초기화
		console.log('Game started!')

		notifySubscribers()

		// 두더지 표시 시작
		showMole()

		// 게임 종료 예약
		gameTimer = setTimeout(endGame, defaultSettings.gameDuration)
	}

	// 게임 끝
	const endGame = () => {
		isPlaying = false // 게임 종료 상태로 전환
		clearTimeout(gameTimer) // 게임 타이머 제거

		// 모든 두더지 타이머 제거
		moleTimeouts.forEach((timeout) => clearTimeout(timeout))
		moleTimeouts = []
		moles = moles.map(() => false) // 모든 두더지 숨김
		console.log(`Game over! Final score: ${score}`)
		notifySubscribers() // 상태 변경 알림
	}

	// 점수 가져오기
	const getScore = () => score

	// 현재 상태 가져오기
	const getState = () => ({
		isPlaying, // 게임 진행 여부
		score, // 점수
		moles // 두더지 상태 배열
	})

	return {
		startGame, // 게임 시작
		endGame, // 게임 끝
		whack, // 두더지 잡기
		getScore, // 점수 가져오기
		getState, // 현재 상태 가져오기
		subscribe // 상태 변화를 알림
	}
})()

export default createMoleGame
