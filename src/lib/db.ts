import mongoose from "mongoose";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing from your .env file");
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log("Connected to MongoDB");
      return;
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
      const message = err instanceof Error ? err.message : String(err);
      const delay = RETRY_DELAY_MS * attempt;
      console.error(`MongoDB connection attempt ${attempt} failed (${message}). Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}