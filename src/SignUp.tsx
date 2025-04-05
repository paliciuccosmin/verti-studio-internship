import { useState } from "react";

const SignUp = () => {
    const [name, setname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            handleError("Please fill in all fields");
            return;
        }
        fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email,phone, address, password }),
        })
            .then((response) => {
                if (response.ok) {
                    handleSuccess("User created successfully");
                } else {
                    handleError("Error creating user");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                handleError("Network error");
            });
    };
    const handleError = (error: string) => {
        setError(error);
        setSuccess("");
    };
    const handleSuccess = (message: string) => {
        setSuccess(message);
        setError("");
    };
    return (
        <div className="flex flex-col justify-center items-center h-screen shadow-lg bg-gray-100">
            
            <div className="flex flex-col justify-center items-center bg-white p-6 rounded-lg shadow-md">
            <img
                src="https://mllj2j8xvfl0.i.optimole.com/cb:3970~373ad/w:342/h:112/q:mauto/f:best/https://themeisle.com/wp-content/uploads/2019/03/logo.png"
                alt="Logo"
                className="mb-2 rounded-full scale-40"
            />
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
            <form className="w-80">
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="username">
                        Name
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={name}
                        onChange={(e) => setname(e.target.value)}
                        placeholder="Enter your username"
                        required
                        autoComplete="username"
                        autoFocus
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Enter your email"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="phone">
                        Phone
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Enter your phone number"
                        required
                        autoComplete="tel"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="address">
                        Address
                    </label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Enter your address"
                        required
                        autoComplete="address"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        minLength={8}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="Enter your password"
                    />
                </div>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="w-full bg-indigo-400 text-white py-2 rounded-lg hover:bg-indigo-600 transition duration-200 mt-4"
                >
                    Sign Up
                </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <p className="mt-4 text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-indigo-500 hover:underline">
                    Log In
                </a>
            </p>
            </div>
        </div>
    );
}

export default SignUp;