import { useEffect, useState } from "react";
import { computeBitSlow } from "./bitslow";
import Navbar from "./components/Navbar";

const PAGE_SIZE = 30;

export default function Shop({ }) {
    interface coin {
        coin_id: string;
        bit1: number;
        bit2: number;
        bit3: number;
        value: number;
        client_id: string | null;
    }
    interface user{
        id: string;
        name: string;
        email: string;
    }

    const [coins, setCoins] = useState<coin[]>([]);
    const [user, setUser] = useState<user | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState("");
    const [generating, setGenerating] = useState(false);

    const fetchCoins = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/bitslows?page=${page}`);
            if (!res.ok) throw new Error("Failed to load BitSlows");
            const data = await res.json();
            setCoins(data);
        } catch (err) {
            setError("Could not fetch BitSlows.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCoins();
        // eslint-disable-next-line
    }, [page]);

    const handleBuy = async (coin_id: string) => {
        setLoading(true);
        setError(""); setSuccess("");
        const res = await fetch("/api/buy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coin_id, buyer_id: user?.id }),
        });
        if (res.ok) {
            setSuccess("Purchase successful!");
            fetchCoins();
        } else {
            const msg = await res.text();
            setError(msg || "Could not buy coin.");
        }
        setLoading(false);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setError(""); setSuccess("");
        const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, owner_id: user?.id }),
        });
        if (res.ok) {
            setSuccess("Coin generated!");
            setShowModal(false);
            setAmount("");
            fetchCoins();
        } else {
            const msg = await res.text();
            setError(msg || "No unique combinations left.");
        }
        setGenerating(false);
    };

    return (
        <>
            <Navbar />
            <div className="max-w-5xl mx-auto mt-8 p-4 bg-white rounded shadow">
                <h1 className="text-2xl font-bold mb-4">BitSlow Marketplace</h1>
                {loading && <div className="text-blue-500 mb-2">Loading...</div>}
                {error && <div className="text-red-500 mb-2">{error}</div>}
                {success && <div className="text-green-600 mb-2">{success}</div>}
                <div className="flex justify-between mb-4">
                    <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        onClick={() => setShowModal(true)}
                        disabled={generating}
                    >
                        Generate Coin
                    </button>
                    <div>
                        <button
                            className="mr-2 px-3 py-1 rounded border"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Prev
                        </button>
                        <span>Page {page}</span>
                        <button
                            className="ml-2 px-3 py-1 rounded border"
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
                <table className="min-w-full table-auto mb-4">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2">Hash</th>
                            <th className="px-4 py-2">Components</th>
                            <th className="px-4 py-2">Value</th>
                            <th className="px-4 py-2">Owner</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {coins.map((coin) => (
                            <tr key={coin.coin_id} className="border-b">
                                <td className="px-4 py-2 font-mono">
                                    {computeBitSlow(coin.bit1, coin.bit2, coin.bit3)}
                                </td>
                                <td className="px-4 py-2">
                                    {coin.bit1}, {coin.bit2}, {coin.bit3}
                                </td>
                                <td className="px-4 py-2">{coin.value}</td>
                                <td className="px-4 py-2">
                                    {coin.client_id ? coin.client_id : <span className="text-gray-400">Unowned</span>}
                                </td>
                                <td className="px-4 py-2">
                                    {!coin.client_id && (
                                        <button
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                            onClick={() => handleBuy(coin.coin_id)}
                                            disabled={loading}
                                        >
                                            Buy
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Generate Coin Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded shadow-lg w-80">
                            <h2 className="text-lg font-bold mb-2">Generate New BitSlow</h2>
                            <input
                                type="number"
                                className="w-full border px-3 py-2 rounded mb-3"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                min={1}
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                                    onClick={handleGenerate}
                                    disabled={generating || !amount}
                                >
                                    {generating ? "Generating..." : "Create"}
                                </button>
                                <button
                                    className="px-4 py-2 rounded border"
                                    onClick={() => setShowModal(false)}
                                    disabled={generating}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}