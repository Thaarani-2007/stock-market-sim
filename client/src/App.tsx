import { useEffect } from 'react'
import { useAuthStore, useUserStore } from './lib/store'
import { makeRequest, SERVER_HOST, showMessage } from './lib/utils'
import { createBrowserRouter, RouterProvider } from 'react-router'

import Stock from './pages/stock/page'
import Portfolio from './pages/portfolio/page'
import HomePage from './pages/auth/page'
import TransactionPage from './pages/transactions/transactions'
import Leaderboard from './pages/leaderboard/newlb'


const App = () => {
	const login = useAuthStore(state => state.setLogged)
	const profile = useUserStore(state => state.update)

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (token) {
			login(true)
			makeRequest('user', 'GET', undefined, true)
				.then(res => profile(res["balance"], res["owned"]))
			
		}

		const socket = new WebSocket(`ws://${SERVER_HOST}/news/`)
		socket.onmessage = (ev: MessageEvent) => showMessage(JSON.parse(ev.data).message)
		socket.onclose = () => { if (socket.readyState === WebSocket.CLOSED) alert("Connection interrupted! Please refresh!") }
		
		return () => { if (socket.readyState === WebSocket.OPEN) socket.close() }
	}, [login, profile])

	return (
		<>
			<Navbar />
			<div id="toast" className="py-3 px-5 absolute transition right-[25px] w-[300px] rounded z-[99999]">
				Test message
			</div>
			<main>
				<RouterProvider router={createBrowserRouter([
					{ path: "/stocks/", Component: Stock },
					{ path: "/portfolio/", Component: Portfolio },
					{ path: "/transactions/", Component: TransactionPage },
					{ path: '/leaderboard/', Component: Leaderboard },
					{ path: "/", Component: HomePage}
				])} />
			</main>
		</>
	)
}

const Navbar = () => {
	return (
		<nav>

		</nav>
	)
}

export default App
