import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { useNavigate } from "react-router-dom";

interface Coin {
	coin_id: number;
	bit1: number;
	bit2: number;
	bit3: number;
	value: number;
	client_id: number | null;
	owner_name: string;
	hash: string;
}

const PAGE_SIZE = 30;

export default function Shop() {
	const [coins, setCoins] = useState<Coin[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);

	const [showModal, setShowModal] = useState(false);
	const [newCoinAmount, setNewCoinAmount] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		fetchCoins();
	}, []);

	async function fetchCoins() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/coins", {
				method: "GET",
				credentials: "include",
			});
			if (!res.ok) {
				if (res.status === 401) {
					// not logged in => redirect to login
					navigate("/login");
					return;
				}
				throw new Error("Failed to fetch coins");
			}

			const data: Coin[] = await res.json();
			setCoins(data);
		} catch (err: any) {
			setError(err.message || "Error fetching coins.");
		} finally {
			setLoading(false);
		}
	}

	async function handleBuy(coin_id: number) {
		try {
			const res = await fetch("/api/buy-coin", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ coin_id }),
			});
			if (!res.ok) {
				throw new Error("Failed to buy coin");
			}
			await fetchCoins();
		} catch (err: any) {
			alert(err.message || "Error buying coin");
		}
	}

	async function handleGenerateCoin() {
		try {
			const res = await fetch("/api/coins", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount: parseFloat(newCoinAmount) }),
			});
			if (res.status === 409) {
				alert("No more unique combos available!");
			} else if (!res.ok) {
				throw new Error("Failed to generate coin");
			}
			setShowModal(false);
			setNewCoinAmount("");
			await fetchCoins();
		} catch (err: any) {
			alert(err.message || "Error generating coin");
		}
	}

	// Pagination
	const startIndex = (currentPage - 1) * PAGE_SIZE;
	const endIndex = startIndex + PAGE_SIZE;
	const pageCoins = coins.slice(startIndex, endIndex);
	const totalPages = Math.ceil(coins.length / PAGE_SIZE);

	if (loading) {
		return (
			<>
				<Navbar />
				<div className="flex flex-col items-center justify-center h-screen">
					<div className="text-gray-700">Loading Shop...</div>
				</div>
			</>
		);
	}

	if (error) {
		return (
			<>
				<Navbar />
				<div className="p-4 text-red-500 text-center">Error: {error}</div>
			</>
		);
	}

	return (
		<>
			<Navbar />
			<div className="max-w-5xl mx-auto p-4">
				<div className="flex justify-between items-center mb-4">
					<h1 className="text-2xl font-bold">BitSlow Marketplace</h1>
					<button
						className="bg-blue-500 text-white px-4 py-2 rounded"
						onClick={() => setShowModal(true)}
					>
						Generate Coin
					</button>
				</div>

				{/* Table of coins */}
				<div className="overflow-x-auto">
					<table className="w-full bg-white shadow-md rounded">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-2 text-left">Coin ID</th>
								<th className="px-4 py-2 text-left">Hash</th>
								<th className="px-4 py-2 text-left">Bits</th>
								<th className="px-4 py-2 text-left">Value</th>
								<th className="px-4 py-2 text-left">Owner</th>
								<th className="px-4 py-2"></th>
							</tr>
						</thead>
						<tbody>
							{pageCoins.map((coin) => (
								<tr key={coin.coin_id} className="border-b">
									<td className="px-4 py-2">{coin.coin_id}</td>
									<td
										className="px-4 py-2 break-all"
										style={{ maxWidth: "220px" }}
									>
										{coin.hash}
									</td>
									<td className="px-4 py-2">
										{coin.bit1}, {coin.bit2}, {coin.bit3}
									</td>
									<td className="px-4 py-2">${coin.value}</td>
									<td className="px-4 py-2">
										{coin.client_id
											? coin.owner_name || `User #${coin.client_id}`
											: "Unowned"}
									</td>
									<td className="px-4 py-2">
										{/* Show Buy button only if unowned */}
										{!coin.client_id && (
											<button
												onClick={() => handleBuy(coin.coin_id)}
												className="bg-green-500 text-white px-3 py-1 rounded"
											>
												Buy
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination controls */}
				{totalPages > 1 && (
					<div className="flex justify-center items-center mt-4 space-x-4">
						<button
							onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
							disabled={currentPage === 1}
							className="px-3 py-1 border rounded disabled:opacity-50"
						>
							Prev
						</button>
						<div>
							Page {currentPage} of {totalPages}
						</div>
						<button
							onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
							disabled={currentPage === totalPages}
							className="px-3 py-1 border rounded disabled:opacity-50"
						>
							Next
						</button>
					</div>
				)}
			</div>

			{/* Modal for generating a coin */}
			{showModal && (
				<div className="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-md w-80">
						<h2 className="text-xl font-bold mb-4">Generate a BitSlow Coin</h2>
						<label className="block mb-2 text-sm font-medium">Amount:</label>
						<input
							type="number"
							value={newCoinAmount}
							onChange={(e) => setNewCoinAmount(e.target.value)}
							className="w-full mb-4 p-2 border rounded"
							placeholder="Enter coin value"
						/>
						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowModal(false)}
								className="bg-gray-500 text-white px-4 py-2 rounded"
							>
								Cancel
							</button>
							<button
								onClick={handleGenerateCoin}
								className="bg-indigo-600 text-white px-4 py-2 rounded"
							>
								Generate
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
