import { serve } from "bun";
import { Database } from "bun:sqlite";
import { seedDatabase } from "./seed";
import index from "./index.html";
import { computeBitSlow } from "./bitslow";
import bcrypt from "bcryptjs";

// Initialize the database
const db = new Database(":memory:");

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
		"/*": index,
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
		"/api/signup": async (req) => {
			try{ 
				const { name, email, phone, address, password } = await req.json();

				// Hash the password
				const hashedPassword = bcrypt.hashSync(password, 10);

				// Insert the new client into the database
				db.run(
					`INSERT INTO clients (name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)`,
					name,
					email,
					phone,
					address,
					hashedPassword,
				);

				return new Response("User created successfully", { status: 201 });
			}
			catch (error) {
				console.error("Error creating user:", error);
				return new Response("Error creating user", { status: 500 });
			}
		},
		"/api/login": async (req) => {
			try {
				const { email, password } = await req.json();

				// Fetch the user from the database
				const user = db
					.query(`SELECT * FROM clients WHERE email = ?`)
					.get(email);

				if (!user) {
					return new Response("User not found", { status: 404 });
				}

				// Check if the password is correct
				const isPasswordValid = bcrypt.compareSync(password, user.password);

				if (!isPasswordValid) {
					return new Response("Invalid password", { status: 401 });
				}

				// Set a cookie or session here if needed
				const sessionId = db
						.query(`SELECT id FROM clients WHERE email = ?`)
						.get(email);
				return new Response("Login successful", { status: 200 });
			} catch (error) {
				console.error("Error logging in:", error);
				return new Response("Error logging in", { status: 500 });
			}
		}

	},
	development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
