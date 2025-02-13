import React, { useState } from "react";
import axios from "axios";

const ReportDisaster = () => {
    const [location, setLocation] = useState("");
    const [disasterType, setDisasterType] = useState("");
    const [severity, setSeverity] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [loading, setLoading] = useState(false);

    const submitReport = async (e) => {
        e.preventDefault();

        // Validate Latitude & Longitude
        if (isNaN(lat) || isNaN(lng)) {
            alert("Please enter valid latitude and longitude values.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/report`, {
                location,
                disasterType,
                severity,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
            });

            alert("✅ Disaster reported successfully!");
            setLocation("");
            setDisasterType("");
            setSeverity("");
            setLat("");
            setLng("");
        } catch (error) {
            console.error("❌ Error reporting disaster:", error);
            alert("Failed to report disaster.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <form className="space-y-4" onSubmit={submitReport}>

                {/* Location Input */}
                <input
                    type="text"
                    placeholder="📍 Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-gray-700"
                    required
                />

                {/* Disaster Type Dropdown */}
                <select
                    value={disasterType}
                    onChange={(e) => setDisasterType(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-gray-700"
                    required
                >
                    <option value="">🌍 Select Disaster Type</option>
                    <option value="Fire">🔥 Fire</option>
                    <option value="Flood">🌊 Flood</option>
                    <option value="Tornado">🌪 Tornado</option>
                    <option value="Earthquake">🌍 Earthquake</option>
                    <option value="Hurricane">🌀 Hurricane</option>
                    <option value="Other">⚠️ Other</option>
                </select>

                {/* Severity Dropdown */}
                <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-gray-700"
                    required
                >
                    <option value="">⚠️ Select Severity</option>
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option>
                </select>

                {/* Latitude Input */}
                <input
                    type="text"
                    placeholder="🌍 Latitude"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-gray-700"
                    required
                />

                {/* Longitude Input */}
                <input
                    type="text"
                    placeholder="📍 Longitude"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-gray-700"
                    required
                />

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition"
                    disabled={loading}
                >
                    {loading ? "Reporting..." : "🚀 Submit Report"}
                </button>
            </form>
        </div>
    );
};

export default ReportDisaster;
