import { createBrowserRouter, RouterProvider } from 'react-router'

import Login from './login/page'
import Stock from './stock/page'


const App = () => {
	return (
		<>
			<Navbar />
			<main>
				<RouterProvider router={createBrowserRouter([
					{ path: "/login/", Component: Login },
					{ path: "/stocks/", Component: Stock }
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
