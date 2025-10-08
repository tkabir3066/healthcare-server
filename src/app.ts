import compression from "compression";
import cors from "cors";
import express from "express";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";

const app = express();

// Middleware
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(compression()); // Compresses response bodies for faster delivery
app.use(express.json()); // Parse incoming JSON requests

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// app.use("/api/v1", router);
// Default route for testing
app.get("/", (_req, res) => {
  res.send("API is running");
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
