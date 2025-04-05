import { serve } from "bun";
import { Database } from "bun:sqlite";
import { seedDatabase } from "./seed";
import index from "./index.html";
import { computeBitSlow } from "./bitslow";
import bcrypt from "bcryptjs";

// Initialize the database
const db = new Database("mydb.sqlite");

// Seed the database with random data
seedDatabase(db, {
	clientCount: 30,
	bitSlowCount: 20,
	transactionCount: 50,
	clearExisting: true,
});

const server = serve({
	routes: {
		// Serve index.html for all unmatched routes.
		"/api/signup":{
			POST: async (req) => {
				try {
					const { name, email, password, phone, address } = await req.json();
			
					if (!name || !email || !password) {
						return new Response(JSON.stringify({ error: "Please fill in all fields" }), { status: 400 });
					}
			
					const existingUser = db.prepare("SELECT * FROM clients WHERE email = ?").get(email);
					if (existingUser) {
						return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
					}
			
					const hashedPassword = await bcrypt.hash(password, 10);
					const stmt = db.prepare("INSERT INTO clients (name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)");
					stmt.run(name, email, phone, address, hashedPassword);
			
					return new Response(JSON.stringify({ message: "User created successfully" }), { status: 200 });
				} catch (err) {
					console.error("Signup error:", err);
					return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
				}
			},
		},
		"/api/login": {
			POST: async (req) => {
				const { email, password } = await req.json();
				if (!email || !password) {
					return new Response("Please fill in all fields", { status: 400 });
				}
				const user = db
					.prepare("SELECT * FROM clients WHERE email = ?")
					.get(email);
				if (!user) {
					return new Response("User not found", { status: 404 });
				}
				const isPasswordValid = await bcrypt.compare(password, user.password);
				if (!isPasswordValid) {
					return new Response("Invalid password", { status: 401 });
				}
				return new Response("Login successful", { status: 200 });
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
