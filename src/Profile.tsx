import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";

const Profile = () => {
	interface Transaction {
		id: string;
		coin_id: string;
		buyer_id: string;
		seller_id: string;
		timestamp: string;
	}

	interface ProfileData {
		user: {
			name: string;
			created_at: string;
			email: string;
			phone: string;
			address: string;
		};
		totalTransactions: number;
		totalBitSlow: number;
		totalValue: number;
		transactions: Transaction[];
	}

	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await fetch("/api/profile", {
					method: "GET",
					credentials: "include", // Ensure cookies are included in the request
				});

				if (!res.ok) {
					throw new Error("Not authenticated");
				}

				const data = await res.json();
				setProfile(data); // Set the profile data if authenticated
			} catch (err: any) {
				setError(err.message);
				// Redirect to login page if not authenticated
				navigate("/login");
			}
		};
		fetchProfile();
	}, [navigate]);

	if (error) {
		return <div>{error}</div>;
	}

	if (!profile) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<Navbar />
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Profile Card */}
				<div className="bg-white rounded-xl p-6 shadow-md col-span-1">
					<div className="flex items-center gap-4">
						<div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
							{profile.user.name.charAt(0)}
						</div>
						<div>
							<h2 className="text-xl font-semibold text-gray-800">
								{profile.user.name}
							</h2>
							<p className="text-gray-500">
								Joined {new Date(profile.user.created_at).toLocaleDateString()}
							</p>
						</div>
					</div>

					<div className="mt-6 space-y-4">
						<div>
							<p className="text-sm text-gray-500">Email</p>
							<p className="text-lg font-medium">{profile.user.email}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Phone</p>
							<p className="text-lg font-medium">{profile.user.phone}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Address</p>
							<p className="text-lg font-medium">{profile.user.address}</p>
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className="bg-white rounded-xl p-6 shadow-md col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="text-center">
						<h3 className="text-gray-500">Total Transactions</h3>
						<p className="text-3xl font-bold text-blue-600">
							{profile.totalTransactions}
						</p>
					</div>
					<div className="text-center">
						<h3 className="text-gray-500">Total BitSlow</h3>
						<p className="text-3xl font-bold text-yellow-500">
							{profile.totalBitSlow}
						</p>
					</div>
					<div className="text-center">
						<h3 className="text-gray-500">Total Value</h3>
						<p className="text-3xl font-bold text-green-600">
							${profile.totalValue}
						</p>
					</div>
				</div>
			</div>

			{/* Transactions */}
			<div className="mt-10 bg-white p-6 rounded-xl shadow-md">
				<h2 className="text-xl font-semibold mb-4 text-gray-700">
					Transaction History
				</h2>
				<div className="overflow-x-auto">
					<table className="min-w-full table-auto text-left text-sm">
						<thead className="bg-gray-100 text-gray-600 uppercase">
							<tr>
								<th className="px-4 py-2">ID</th>
								<th className="px-4 py-2">Coin ID</th>
								<th className="px-4 py-2">Buyer ID</th>
								<th className="px-4 py-2">Seller ID</th>
								<th className="px-4 py-2">Timestamp</th>
							</tr>
						</thead>
						<tbody>
							{profile.transactions.map((tx) => (
								<tr key={tx.id} className="border-b hover:bg-gray-50">
									<td className="px-4 py-2">{tx.id}</td>
									<td className="px-4 py-2">{tx.coin_id}</td>
									<td className="px-4 py-2">{tx.buyer_id}</td>
									<td className="px-4 py-2">{tx.seller_id}</td>
									<td className="px-4 py-2">
										{tx.transaction_date
											? new Date(
													tx.transaction_date.replace(" ", "T"),
												).toLocaleString()
											: "Unknown"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};

export default Profile;
