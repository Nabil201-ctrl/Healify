import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { EstablishConnection, consumeNotifications } from "./config/Mq.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Notification Microservice is running");
});

const startServer = async () => {
    try {
        await EstablishConnection();
        consumeNotifications();

        app.listen(PORT, () => {
            console.log(`Notification Microservice listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

startServer();
