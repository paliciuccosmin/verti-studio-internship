import { useNavigate } from "react-router-dom";
import { useState } from "react";
const Navbar = () => {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);

	const logout = async () => {
		try {
			const res = await fetch("/api/logout", {
				method: "POST",
				credentials: "include", // Ensure cookies are included in the request
			});
			if (!res.ok) {
				throw new Error("Logout failed");
			}
			navigate("/login");
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<nav className="bg-gray-800 p-4">
			<div className="container mx-auto flex justify-between items-center">
				<h1 className="text-white text-2xl font-bold">BitSlow</h1>
				<div className="flex space-x-4">
					<button
						onClick={() => navigate("/profile")}
						className="text-white px-4 py-2 rounded hover:bg-gray-700"
					>
						Profile
					</button>
					<button
						onClick={() => navigate("/app")}
						className="text-white px-4 py-2 rounded hover:bg-gray-700"
					>
						Transactions
					</button>
					<button
						onClick={() => navigate("/shop")}
						className="text-white px-4 py-2 rounded hover:bg-gray-700"
					>
						Shop
					</button>
					<button
						onClick={logout}
						className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
					>
						Logout
					</button>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
