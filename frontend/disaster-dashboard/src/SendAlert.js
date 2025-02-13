import React, { useState } from "react";
import axios from "axios";
import { FiSend } from "react-icons/fi"; // Send Icon
import { FaPhoneAlt } from "react-icons/fa"; // Phone Icon

const SendAlert = () => {
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("🚨 Disaster Alert! Stay safe!");
    const [loading, setLoading] = useState(false);

    const validatePhoneNumber = (phoneNumber) => {
        const e164Regex = /^\+\d{10,15}$/; // E.164 format: +1234567890
        return e164Regex.test(phoneNumber);
    };

    const sendAlert = async (e) => {
        e.preventDefault();

        if (!validatePhoneNumber(phone)) {
            alert("❌ Invalid phone number. Use E.164 format (e.g., +1234567890).");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/alert`, { phone, message });
            alert("✅ Alert sent successfully!");
            setPhone("");
        } catch (error) {
            console.error("❌ Error sending alert:", error);
            alert("Failed to send alert.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg text-white">
            <form className="space-y-6" onSubmit={sendAlert}>

                {/* Phone Number Input */}
                <div className="relative">
                    <FaPhoneAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 p-3 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                        required
                    />
                </div>

                {/* Read-Only Message */}
                <textarea
                    className="w-full p-3 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    value={message}
                    readOnly
                ></textarea>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`w-full flex items-center justify-center gap-2 p-3 text-white font-semibold rounded-lg transition-all transform ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 hover:scale-105 shadow-lg"
                        }`}
                    disabled={loading}
                >
                    {loading ? "Sending..." : "🚀 Send Alert"}
                    {!loading && <FiSend />}
                </button>
            </form>
        </div>
    );
};

export default SendAlert;
