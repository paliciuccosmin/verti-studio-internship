import { serve } from "bun";
import { Database } from "bun:sqlite";
import { seedDatabase } from "./seed";
import index from "./index.html";
import { computeBitSlow } from "./bitslow";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Initialize the database
const db = new Database("mydb.sqlite");

// Seed the database with random data
// seedDatabase(db, {
// 	clientCount: 30,
// 	bitSlowCount: 20,
// 	transactionCount: 50,
// 	clearExisting: true,
// });

const server = serve({
	routes: {
		// Serve index.html for all unmatched routes.
		"/api/signup": {
			POST: async (req: Request) => {
				try {
					const { name, email, password, phone, address } = await req.json();

					if (!name || !email || !password) {
						return new Response(
							JSON.stringify({ error: "Please fill in all fields" }),
							{ status: 400 },
						);
					}

					const existingUser = db
						.prepare("SELECT * FROM clients WHERE email = ?")
						.get(email);
					if (existingUser) {
						return new Response(
							JSON.stringify({ error: "User already exists" }),
							{ status: 409 },
						);
					}

					const hashedPassword = await bcrypt.hash(password, 10);
					const stmt = db.prepare(
						"INSERT INTO clients (name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)",
					);
					stmt.run(name, email, phone, address, hashedPassword);

					return new Response(
						JSON.stringify({ message: "User created successfully" }),
						{ status: 200 },
					);
				} catch (err) {
					console.error("Signup error:", err);
					return new Response(
						JSON.stringify({ error: "Internal server error" }),
						{ status: 500 },
					);
				}
			},
		},
		"/api/login": {
			POST: async (req) => {
				type User = {
					id: number;
					email: string;
					password: string;
				};

				try {
					const { email, password } = await req.json();
					if (!email || !password) {
						return new Response("Please fill in all fields", { status: 400 });
					}

					const user = db
						.prepare("SELECT * FROM clients WHERE email = ?")
						.get(email) as User;
					if (!user) {
						return new Response("User not found", { status: 404 });
					}

					const isPasswordValid = await bcrypt.compare(password, user.password);
					if (!isPasswordValid) {
						return new Response("Invalid password", { status: 401 });
					}
					// Set session cookie with JWT
					const token = jwt.sign(
						{ id: user.id, email: user.email },
						"process.env.JWT_SECRET",
						{
							expiresIn: "1h", // Expires in 1 hour
						},
					);

					// Set the cookie in the response (with httpOnly for security)
					return new Response(JSON.stringify({ message: "Login successful" }), {
						status: 200,
						headers: {
							"Set-Cookie": `token=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
						},
					});
				} catch (error) {
					console.error("Error during login:", error);
					return new Response("Internal server error", { status: 500 });
				}
			},
		},

		"/api/profile": {
			GET: async (req) => {
				const cookieHeader = req.headers.get("Cookie");
				if (!cookieHeader) {
					return new Response("Unauthorized", { status: 401 });
				}

				// Extract the token from the cookies
				const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
					const [name, value] = cookie.trim().split("=");
					acc[name] = value;
					return acc;
				}, {});

				const token = cookies.token;

				if (!token) {
					return new Response("Unauthorized", { status: 401 });
				}

				try {
					// Verify the JWT token
					const decoded = jwt.verify(token, "process.env.JWT_SECRET");
					const userId = (decoded as { id: number }).id;
					const user = db
						.prepare("SELECT * FROM clients WHERE id = ?")
						.get(userId);
					if (!user) {
						return new Response("User not found", { status: 404 });
					}
					// Fetch user transactions
					const userTransactions = db
						.prepare(
							"SELECT * FROM transactions WHERE buyer_id = ? OR seller_id = ?",
						)
						.all(userId, userId);

					const totalTransactions = userTransactions.length;

					// Get current holdings directly from the coins table
					const userHoldings = db
						.prepare(
							`SELECT 
							COALESCE(SUM(value), 0) AS totalValue, 
							COALESCE(SUM(bit1 + bit2 + bit3), 0) AS totalBitSlow 
							FROM coins 
							WHERE client_id = ?`,
						)
						.get(userId);

					const profileData = {
						totalTransactions,
						totalBitSlow: userHoldings.totalBitSlow,
						totalValue: userHoldings.totalValue,
						transactions: userTransactions,
						user,
					};
					console.log("Profile data:", profileData);
					return new Response(JSON.stringify(profileData), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				} catch (err) {
					return new Response("Unauthorized", { status: 401 });
				}
			},
		},
		"/api/logout": {
			POST: async (req) => {
				try {
					// Clear the cookie by setting its max-age to 0
					return new Response("Logout successful", {
						status: 200,
						headers: {
							"Set-Cookie": `token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0`,
						},
					});
				} catch (error) {
					console.error("Error during logout:", error);
					return new Response("Internal server error", { status: 500 });
				}
			},
		},

		"/api/transactions": () => {
			try {
				const transactions = db
					.query(`
          SELECT 
            t.id, 
            t.coin_id, 
            t.amount, 
            t.transaction_date,
            seller.id as seller_id,
            seller.name as seller_name,
            buyer.id as buyer_id,
            buyer.name as buyer_name,
            c.bit1,
            c.bit2,
            c.bit3,
            c.value
          FROM transactions t
          LEFT JOIN clients seller ON t.seller_id = seller.id
          JOIN clients buyer ON t.buyer_id = buyer.id
          JOIN coins c ON t.coin_id = c.coin_id
          ORDER BY t.transaction_date DESC
        `)
					.all();

				// Add computed BitSlow to each transaction
				const enhancedTransactions = transactions.map((transaction) => ({
					...transaction,
					computedBitSlow: computeBitSlow(
						transaction.bit1,
						transaction.bit2,
						transaction.bit3,
					),
				}));

				return Response.json(enhancedTransactions);
			} catch (error) {
				console.error("Error fetching transactions:", error);
				return new Response("Error fetching transactions", { status: 500 });
			}
		},
		"/*": index, // catch-all should come last
	},
	development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
