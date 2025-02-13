import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig"; // ✅ Corrected Firestore Import
import { collection, getDocs, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

const CommunityForum = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        if (!db) return; // ✅ Ensures db is available before running Firestore calls

        const messagesCollection = collection(db, "messages");
        const q = query(messagesCollection, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => doc.data()));
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            await addDoc(collection(db, "messages"), {
                text: newMessage,
                timestamp: new Date()
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {messages.map((msg, index) => (
                <p key={index}>{msg.text}</p>
            ))}
            <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-2 border rounded mt-2"
            />
            <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            >
                Send
            </button>
        </div>
    );
};

export default CommunityForum;
