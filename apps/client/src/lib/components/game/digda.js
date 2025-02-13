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

const createMoleGame = (customSettings = {}) => {
	/**
	 * 기본 게임 설정을 반환합니다.
	 *
	 * @returns {Settings} 기본 설정 객체
	 */
	const getDefaultSettings = () => ({
		moleCount: 9, // 두더지 수
		gameDuration: 10000, // 게임 전체 시간 (ms)
		moleDurationMin: 200, // 최소 나타나는 시간 (ms)
		moleDurationMax: 300 // 최대 나타나는 시간 (ms)
	})

	/**
	 * 게임 설정을 업데이트하고 초기화합니다.
	 *
	 * @param {Settings} customSettings - 사용자 정의 설정
	 * @param {Settings} currentSettings - 현재 설정
	 * @returns {Settings} 업데이트된 설정
	 */
	const updateSettings = (customSettings, currentSettings) => ({
		...currentSettings,
		...customSettings
	})

	/**
	 * @typedef {Object} Mole
	 * @property {boolean} isVisible - 두더지의 표시 여부
	 * @property {NodeJS.Timeout | null} timeoutId - 두더지 타이머 ID
	 */

	/** @type {Mole[]} */
	let moles = [] // 두더지 상태 배열

	let settings = getDefaultSettings() // 게임 설정

	/** @type {NodeJS.Timeout | null} */
	let gameTimer = null

	/** @type {boolean} */
	let isPlaying = false // 게임 진행 여부

	/** @type {number} */
	let score = 0 // 점수

	/**
	 * 현재 게임 상태를 반환합니다.
	 *
	 * @returns {GameState} 현재 상태
	 */
	const getState = () => ({
		isPlaying,
		score,
		moles: moles.map((mole) => mole.isVisible)
	})

	/**
	 * 구독자 관리를 위한 객체
	 *
	 * @type {{
	 * 	subscribers: Set<Function>
	 * 	notify: Function
	 * 	subscribe: Function
	 * 	unsubscribe: Function
	 * }}
	 */
	const subscribers = {
		subscribers: new Set(),

		notify(state) {
			this.subscribers.forEach((callback) => {
				try {
					callback(state)
				} catch (error) {
					console.error('구독자 알림 중 오류:', error)
				}
			})
		},

		subscribe(callback) {
			this.subscribers.add(callback)
			// 구독 해제 함수 반환
			return () => this.unsubscribe(callback)
		},

		unsubscribe(callback) {
			this.subscribers.delete(callback)
		}
	}

	/** 현재 상태를 모든 구독자에게 알립니다. */
	const notifySubscribers = () => {
		const state = getState()
		subscribers.notify(state)
	}

	/**
	 * 두더지 상태를 초기화합니다.
	 *
	 * 함수 인자 도입: settings를 함수 인자로 받아 외부 상태에 의존하지 않도록 합니다. 이는 함수의 순수성을 높이고, 테스트를 용이하게 합니다. 반환값 명확화:
	 * 초기화된 두더지 배열을 반환하여, 함수의 결과를 명확하게 알 수 있습니다.함수 인자 도입: settings를 함수 인자로 받아 외부 상태에 의존하지 않도록 합니다. 반환값
	 * 명확화: 초기화된 두더지 배열을 반환하여, 함수의 결과를 명확하게 알 수 있습니다.
	 *
	 * @param {Settings} settings - 현재 게임 설정
	 * @returns {Mole[]} 초기화된 두더지 배열
	 */
	const initMoles = (settings) =>
		Array.from({ length: settings.moleCount }, () => ({
			isVisible: false,
			timeoutId: null
		}))

	// 랜덤한 두더지 선택 및 표시 함수
	const showMole = () => {
		if (!isPlaying) return

		const randomIndex = Math.floor(Math.random() * settings.moleCount)

		if (!moles[randomIndex].isVisible) {
			revealMole(randomIndex, settings)
		} else {
			// 이미 보이는 두더지면 다시 시도
			showMole()
		}
	}

	// 두더지 나오기 함수
	const revealMole = (index, settings) => {
		// digda 등장
		moles[index].isVisible = true
		console.log(`${index}번째 두더지가 나타났다!`)
		notifySubscribers() // 상태 변경 알림

		// 랜덤한 지속 시간 계산
		const randomDuration = Math.floor(
			Math.random() * (settings.moleDurationMax - settings.moleDurationMin + 1) +
				settings.moleDurationMin
		)

		moles[index].timeoutId = setTimeout(() => hideMole(index), randomDuration)
	}

	// 두더지를 숨기는 함수
	const hideMole = (index) => {
		if (moles[index].isVisible) {
			moles[index].isVisible = false
			console.log(`${index}번째 두더지가 사라졌다!`)
			notifySubscribers()

			// 새로운 두더지 표시
			if (isPlaying) showMole()
		}
	}

	// 두더지를 잡는 함수
	const whackMole = (index) => {
		if (!isPlaying || !moles[index].isVisible) return false

		console.log(`${index}번째 두더지를 잡았다!`)
		score += 1
		moles[index].isVisible = false

		// 기존 타이머 제거
		clearTimeout(moles[index].timeoutId)
		moles[index].timeoutId = null

		notifySubscribers()

		// 새로운 두더지 표시
		if (isPlaying) showMole()
		return true
	}

	// 게임 시작
	const startGame = (customSettings = {}) => {
		console.log('MoleGame: startGame called')
		if (isPlaying) {
			console.warn('게임이 이미 진행 중입니다.')
			return
		}

		// 게임 상태 초기화
		isPlaying = true
		score = 0
		settings = updateSettings(customSettings, settings)
		moles = initMoles(settings)

		console.log('게임이 시작되었습니다!')
		notifySubscribers()

		// 첫 두더지 표시
		showMole()

		// 게임 종료 예약
		gameTimer = setTimeout(endGame, settings.gameDuration)
	}

	/** 게임을 종료합니다. */
	const endGame = () => {
		if (!isPlaying) {
			console.warn('게임이 진행 중이지 않습니다.')
			return
		}

		isPlaying = false
		clearTimeout(gameTimer) // 게임 종료 타이머 제거

		// 모든 두더지 타이머 제거 및 숨김
		moles.forEach((mole, index) => {
			if (mole.timeoutId) {
				clearTimeout(mole.timeoutId)
				mole.timeoutId = null
			}
			if (mole.isVisible) {
				mole.isVisible = false
				console.log(`${index}번째 두더지가 사라졌습니다!`)
			}
		})

		console.log(`게임 종료! 최종 점수: ${score}`)

		// 상태 변경을 구독자에게 알림
		notifySubscribers()
	}

	// 점수 가져오기
	const getScore = () => score

	return {
		startGame, // 게임 시작
		endGame, // 게임 끝
		whackMole, // 두더지 잡기
		getScore, // 점수 가져오기
		getState, // 현재 상태 가져오기
		subscribe: (callback) => subscribers.subscribe(callback) // 상태 변화를 알림
	}
}

// 게임 인스턴스 생성 및 내보내기
export default createMoleGame() // 기본 인스턴스 생성
export { createMoleGame } // 팩토리 함수도 함께 내보내기
