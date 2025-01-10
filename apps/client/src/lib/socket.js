import { writable } from 'svelte/store'
import { io } from 'socket.io-client'
/**
 * @typedef {Object} SocketOptions
 * @property {boolean} [withCredentials=true] - CORS 인증 허용 여부. Default is `true`
 * @property {string[]} [transports=['websocket']] - 전송 프로토콜. Default is `['websocket']`
 * @property {number} [reconnectionAttempts=5] - 재연결 시도 횟수. Default is `5`
 * @property {number} [reconnectionDelay=1000] - 재연결 시도 간격(ms). Default is `1000`
 */

/**
 * Socket.IO 클라이언트 래퍼
 *
 * @class
 */
class SocketWrapper {
	/** @type {import('socket.io-client').Socket} */
	#socket

	#isConnected // 연결 상태만 관리 (true/false)

	constructor() {
		this.#isConnected = writable(false)
	}
	// 연결 상태를 구독할 수 있는 메서드 추가
	get isConnected() {
		return {
			subscribe: this.#isConnected.subscribe
		}
	}

	/**
	 * 소켓 연결을 초기화합니다
	 *
	 * @param {string} [url='http://localhost:3000'] - 서버 URL. Default is `'http://localhost:3000'`
	 * @param {SocketOptions} [options={}] - 소켓 설정. Default is `{}`
	 */
	connect(url = 'http://localhost:3000', options = {}) {
		try {
			this.#socket = io(url, {
				withCredentials: true,
				transports: ['websocket'],
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
				...options
			})

			this.#socket.on('connect', () => {
				console.log('Connected with ID:', this.#socket.id)
				this.#isConnected.set(true) // 연결 상태 업데이트
			})

			this.#socket.on('disconnect', () => {
				console.log('Disconnected')
				this.#isConnected.set(false) // 연결 해제 상태 업데이트
			})

			// 연결 에러 이벤트 리스너
			this.#socket.on('connect_error', (error) => {
				console.error('Connection error:', error)
			})

			return this.#socket
		} catch (error) {
			console.error('Socket initialization error:', error)
			throw error
		}
	}

	/**
	 * 이벤트를 서버로 전송합니다
	 *
	 * @param {string} event - 이벤트 이름
	 * @param {any} data - 전송할 데이터
	 */
	emit(event, data) {
		this.#socket?.emit(event, data)
	}

	/**
	 * 이벤트 리스너를 등록합니다
	 *
	 * @param {string} event - 이벤트 이름
	 * @param {Function} callback - 콜백 함수
	 * @returns {Function} 리스너 해제 함수
	 */
	on(event, callback) {
		if (!this.#socket) {
			console.warn('Socket not initialized. Call connect() first.')
			return () => {}
		}

		// console.log(`Registering listener for event: ${event}`);
		this.#socket.on(event, (...args) => {
			// console.log(`Received ${event} event:`, ...args);
			callback(...args)
		})

		return () => {
			// console.log(`Removing listener for event: ${event}`);
			this.#socket?.off(event, callback)
		}
	}

	/** 소켓 연결을 종료합니다 */
	disconnect() {
		this.#socket?.disconnect()
		this.#isConnected.set(false) // 연결 상태 업데이트
	}
}

export const socket = new SocketWrapper()
