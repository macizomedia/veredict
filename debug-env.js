import { env } from "./src/env.js";

console.log("DATABASE_URL from env.js:", env.DATABASE_URL);
console.log("DATABASE_URL from process.env:", process.env.DATABASE_URL);
console.log("Direct process.env check:", process.env);
