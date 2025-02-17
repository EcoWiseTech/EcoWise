import React, { useState, useEffect, useRef } from "react";
import { useUserContext } from "../../../contexts/UserContext";
import { useAlert } from "../../../contexts/AlertContext";

const SOCKET_URL = "wss://8ox6366ut3.execute-api.us-east-1.amazonaws.com/production"; // Replace with your WebSocket API URL

function SocketConnection() {
    const { user } = useUserContext();
    const { showAlert } = useAlert();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectInterval = useRef(null);

    const connectWebSocket = () => {
        console.log("Connecting to WebSocket...");
        const ws = new WebSocket(SOCKET_URL);

        ws.onopen = () => {
            console.log("Connected to WebSocket");
            setIsConnected(true);
            setSocket(ws);

            // Send a message after connection
            const message = {
                action: "sendMessage",
                message: {
                    userId: user.Username,
                },
            };

            ws.send(JSON.stringify(message));
            console.log("Sent message:", message);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Message received:", event.data);
            if (message.message === "Connection successful")
                return;

            // Show alert for each new message
            showAlert("info", message.message, 4000);

            // Add the new message to the state (ensure uniqueness)
            setMessages((prevMessages) => {
                // Check if the message already exists to avoid duplicates
                if (!prevMessages.some((msg) => msg === event.data)) {
                    return [...prevMessages, event.data];
                }
                return prevMessages;
            });
        };

        ws.onclose = (event) => {
            console.log("WebSocket closed", event);
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return ws;
    };

    useEffect(() => {
        const ws = connectWebSocket();

        return () => {
            if (ws) ws.close();
            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current);
            }
        };
    }, []);  // Empty dependency array to ensure the effect runs only once

    return (
        <></>
    );
}

export default SocketConnection;
