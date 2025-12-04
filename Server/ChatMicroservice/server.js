import express from "express";
import EstablishConnection from "./config/Mq.js";

// Initialize RabbitMQ connection
EstablishConnection()
    .then(channel => {
        console.log("RabbitMQ channel established");
    })
    .catch(error => {
        console.error("Failed to establish RabbitMQ channel:", error);
    });

// Initialize Express app

const app = express();
app.json({ extended: true });


