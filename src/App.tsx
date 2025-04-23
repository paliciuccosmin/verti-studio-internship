import Navbar from "./components/Navbar";
import "./index.css";
import { useState, useEffect } from "react";

interface Transaction {
	id: number;
	coin_id: number;
	amount: number;
	transaction_date: string;
	seller_id: number | null;
	seller_name: string | null;
	buyer_id: number;
	buyer_name: string;
	bit1: number;
	bit2: number;
	bit3: number;
	value: number;
	computedBitSlow: string;
}

const ENDPOINT_URL = "http://localhost:3000/";

function fetchTransactions(): Promise<Transaction[]> {
	return fetch(ENDPOINT_URL + "api/transactions")
		.then((response) => response.json())
		.catch((error) => console.error("Error fetching data:", error));
}

function useTransactions() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchData = () => {
			fetchTransactions()
				.then((data) => {
					setTransactions(data);
					setLoading(false);
				})
				.catch((err) => {
					setError(err);
					setLoading(false);
				});
		};

		fetchData();

		// Real-time updates every 30 seconds
		const intervalId = setInterval(fetchData, 30000);

		return () => clearInterval(intervalId);
	}, []);

	return { transactions, loading, error };
}

export function App() {
	const { transactions, loading, error } = useTransactions();
	const [currentPage, setCurrentPage] = useState(1);
	const [transactionsPerPage, setTransactionsPerPage] = useState(15);
	const [filters, setFilters] = useState({
		startDate: "",
		endDate: "",
		bitSlowMin: "",
		bitSlowMax: "",
		buyerName: "",
		sellerName: "",
	});

	const filteredTransactions = transactions.filter((transaction) => {
		const { startDate, endDate, bitSlowMin, bitSlowMax, buyerName, sellerName } = filters;

		const transactionDate = new Date(transaction.transaction_date);
		const isWithinDateRange =
			(!startDate || transactionDate >= new Date(startDate)) &&
			(!endDate || transactionDate <= new Date(endDate));

		const isWithinBitSlowRange =
			(!bitSlowMin || transaction.computedBitSlow >= bitSlowMin) &&
			(!bitSlowMax || transaction.computedBitSlow <= bitSlowMax);

		const matchesBuyerName = buyerName
			? transaction.buyer_name.toLowerCase().includes(buyerName.toLowerCase())
			: true;

		const matchesSellerName = sellerName
			? transaction.seller_name?.toLowerCase().includes(sellerName.toLowerCase())
			: true;

		return isWithinDateRange && isWithinBitSlowRange && matchesBuyerName && matchesSellerName;
	});

	const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
	const paginatedTransactions = filteredTransactions.slice(
		(currentPage - 1) * transactionsPerPage,
		currentPage * transactionsPerPage
	);

	const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	if (loading) {
		return (
			<>
				<Navbar />
				<div className="flex flex-col justify-center items-center h-screen bg-gray-50">
					<div className="w-16 h-16 mb-4 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
					<p>Loading Transactions...</p>
				</div>
			</>
		);
	}

	if (error) {
		return (
			<div className="text-red-500 p-4 text-center">
				Error loading transactions: {error.message}
			</div>
		);
	}

	return (
		<>
			<Navbar />
			<div className="max-w-7xl mx-auto p-4">
				<h1 className="text-3xl font-bold mb-8 text-gray-800">BitSlow Transactions</h1>

				{/* Filters */}
			<div className="mb-6">
			<h2 className="text-2xl font-bold mb-4">Filters</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
				<input
					type="date"
					name="startDate"
					value={filters.startDate}
					onChange={handleFilterChange}
					className="w-full p-2 border border-gray-300 rounded-md"
				/>
				</div>
				<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
				<input
					type="date"
					name="endDate"
					value={filters.endDate}
					onChange={handleFilterChange}
					className="w-full p-2 border border-gray-300 rounded-md"
				/>
				</div>
				<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Min BitSlow</label>
				<input
					type="number"
					name="bitSlowMin"
					value={filters.bitSlowMin}
					onChange={handleFilterChange}
					className="w-full p-2 border border-gray-300 rounded-md"
					placeholder="Min"
				/>
				</div>
				<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Max BitSlow</label>
				<input
					type="number"
					name="bitSlowMax"
					value={filters.bitSlowMax}
					onChange={handleFilterChange}
					className="w-full p-2 border border-gray-300 rounded-md"
					placeholder="Max"
				/>
				</div>
				<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
				<input
					type="text"
					name="buyerName"
					value={filters.buyerName}
					onChange={handleFilterChange}
					className="w-full p-2 border border-gray-300 rounded-md"
					placeholder="Buyer Name"
				/>
				</div>
				<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">Seller Name</label>
				<input
					type="text"
					name="sellerName"
					value={filters.sellerName}
					onChange={handleFilterChange}
					className="w-full p-2 border border-gray-300 rounded-md"
					placeholder="Seller Name"
				/>
				</div>
			</div>
			</div>


				{/* Pagination Controls */}
				<div className="flex justify-between items-center mb-4">
					<div>
						<label htmlFor="transactionsPerPage" className="mr-2">
							Transactions per page:
						</label>
						<select
							id="transactionsPerPage"
							value={transactionsPerPage}
							onChange={(e) => setTransactionsPerPage(Number(e.target.value))}
							className="p-2 border rounded"
						>
							<option value={15}>15</option>
							<option value={30}>30</option>
							<option value={50}>50</option>
						</select>
					</div>
					<div>
						<button
							disabled={currentPage === 1}
							onClick={() => setCurrentPage((prev) => prev - 1)}
							className="p-2 border rounded mr-2"
						>
							Previous
						</button>
						<span>
							Page {currentPage} of {totalPages}
						</span>
						<button
							disabled={currentPage === totalPages}
							onClick={() => setCurrentPage((prev) => prev + 1)}
							className="p-2 border rounded ml-2"
						>
							Next
						</button>
					</div>
				</div>

				{/* Transactions Table */}
				<div className="overflow-x-auto rounded-lg shadow-md">
					<table className="w-full border-collapse bg-white">
						<thead>
							<tr className="bg-gray-800 text-white">
								<th className="p-4 text-left">ID</th>
								<th className="p-4 text-left">BitSlow</th>
								<th className="p-4 text-left">Seller</th>
								<th className="p-4 text-left">Buyer</th>
								<th className="p-4 text-right">Amount</th>
								<th className="p-4 text-left">Date</th>
							</tr>
						</thead>
						<tbody>
							{paginatedTransactions.map((transaction, index) => (
								<tr
									key={transaction.id}
									className={`hover:bg-gray-50 transition-colors ${
										index === paginatedTransactions.length - 1 ? "" : "border-b border-gray-200"
									}`}
								>
									<td className="p-4 text-gray-600">{transaction.id}</td>
									<td className="p-4">
										<div>
											<div className="font-medium text-gray-800">
												{transaction.computedBitSlow}
											</div>
											<div className="text-xs text-gray-500 mt-1">
												Bits: {transaction.bit1}, {transaction.bit2}, {transaction.bit3}
											</div>
											<div className="text-xs text-gray-500">
												Value: ${transaction.value.toLocaleString()}
											</div>
										</div>
									</td>
									<td className="p-4 text-gray-700">
										{transaction.seller_name ? transaction.seller_name : "Original Issuer"}
									</td>
									<td className="p-4 text-gray-700">{transaction.buyer_name}</td>
									<td className="p-4 text-right font-semibold text-gray-800">
										${transaction.amount.toLocaleString()}
									</td>
									<td className="p-4 text-sm text-gray-600">
										{new Date(transaction.transaction_date).toLocaleString()}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}

export default App;
