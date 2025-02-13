import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";
import DisasterMap from "./DisasterMap";
import DisasterList from "./DisasterList";
import ReportDisaster from "./ReportDisaster";
import SendAlert from "./SendAlert";
import CommunityForum from "./CommunityForum";
import SubscribeAlert from "./SubscribeAlert";
import EmergencyContacts from "./EmergencyContacts";

const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000");

const App = () => {
    const [weather, setWeather] = useState(null);
    const [earthquakes, setEarthquakes] = useState([]);
    const [nasaImage, setNasaImage] = useState(null);
    const [disasters, setDisasters] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
    const [riskLevel, setRiskLevel] = useState(null);

    useEffect(() => {
        getUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            fetchDisasters();
        }
    }, [userLocation]);

    useEffect(() => {
        socket.on("new_disaster", (data) => {
            setDisasters((prev) => [...prev, data]);
            toast.error(`🚨 New Disaster: ${data.disasterType} in ${data.location}`);
        });

        return () => socket.off("new_disaster");
    }, []);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = parseFloat(position.coords.latitude);
                    const lon = parseFloat(position.coords.longitude);

                    if (!isNaN(lat) && !isNaN(lon)) {
                        setUserLocation({ lat, lon });
                        console.log("📍 User location:", lat, lon);
                    } else {
                        console.warn("⚠️ Invalid geolocation data. Defaulting to San Francisco.");
                        setUserLocation({ lat: 37.7749, lon: -122.4194 });
                    }
                },
                (error) => {
                    console.warn("⚠️ Location access denied. Defaulting to San Francisco.");
                    setUserLocation({ lat: 37.7749, lon: -122.4194 });
                },
                { enableHighAccuracy: true }
            );
        } else {
            console.error("⚠️ Geolocation is not supported by this browser.");
            setUserLocation({ lat: 37.7749, lon: -122.4194 });
        }
    };


    const fetchDisasters = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/reports`);
            setDisasters(response.data);
        } catch (error) {
            console.error("❌ Error fetching disasters:", error);
        }
    };

    return (
        <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen transition-all duration-300`}>
            <ToastContainer position="top-right" autoClose={5000} />
            <nav className="flex justify-between items-center p-5 bg-blue-600 text-white shadow-md sticky top-0 z-50">
                <h1 className="text-2xl font-bold">🌍 Disaster Dashboard</h1>
                <button onClick={() => setDarkMode(!darkMode)} className="bg-gray-800 px-4 py-2 rounded-lg">
                    {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
                </button>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                <ReportDisaster fetchDisasters={fetchDisasters} />
                <SendAlert />
                <DisasterMap disasters={disasters} userLocation={userLocation} />
                <CommunityForum />
                <EmergencyContacts userLocation={userLocation} />
                <SubscribeAlert />
                <DisasterList disasters={disasters} />
            </div>
        </div>
    );
};

export default App;
