/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from "react-dom/client";
import { App } from "./App";
import SignUp from "./SignUp";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Profile from "./Profile";

function start() {
	const root = createRoot(document.getElementById("root")!);
	root.render(
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<SignUp />} />
				<Route path="/login" element={<Login />} />
				<Route path="/app" element={<App />} />
				<Route path="/profile" element={<Profile />} />
			</Routes>
		</BrowserRouter>,
	);
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", start);
} else {
	start();
}
