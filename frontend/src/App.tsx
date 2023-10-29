import { BrowserRouter, Route, Routes } from "react-router-dom"
import HomePage from "./HomePage"
import NFTPage from "./NFTPage"
import StartAuctionPage from "./StartAuctionPage"
import "./App.css"
import ConnectWalletPage from "./ConnectWalletPage"

function App() {
  return (
	<div className="background">
	<BrowserRouter>
  	<Routes>
    	<Route path="/" Component={HomePage} />
    	<Route path="/:id" Component={NFTPage} />
    	<Route path="/connect-wallet" Component={ConnectWalletPage} />
    	<Route path="/:start-auction" Component={StartAuctionPage} />
  	</Routes>
	</BrowserRouter>
	</div>
  )
}

export default App
