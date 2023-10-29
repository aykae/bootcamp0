import { useNavigate } from "react-router-dom";

function ConnectWalletPage() {
    const navigate = useNavigate();

    const connectWallet = async () => {
        if (!window.ethereum) {
            console.error("No ethereum object on window")
            return;
        }
        if (window.ethereum.isConnected()) {
            navigate('/');
        }

        try {
            window.ethereum.enable();
            navigate('/');
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div>
            <button onClick={connectWallet}>Connect Wallet</button>
        </div>
    )
}

export default ConnectWalletPage;