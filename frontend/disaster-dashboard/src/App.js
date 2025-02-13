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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
const socket = io(BACKEND_URL);

const App = () => {
    const [weather, setWeather] = useState(null);
    const [earthquakes, setEarthquakes] = useState([]);
    const [nasaImage, setNasaImage] = useState(null);
    const [disasters, setDisasters] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [riskLevel, setRiskLevel] = useState(null);
    const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

    useEffect(() => {
        getUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation) {
            fetchWeather();
            fetchEarthquakeData();
            fetchNasaImage();
            fetchDisasters();
            fetchRiskPrediction();
        }
    }, [userLocation]);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    useEffect(() => {
        socket.on("new_disaster", (data) => {
            setDisasters((prev) => [...prev, data]);
            toast.error(`🚨 New Disaster: ${data.disasterType} in ${data.location}`);
        });

        return () => socket.off("new_disaster");
    }, []);

    // 📍 **Get User Location**
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

    // 🌦 **Fetch Weather Data**
    const fetchWeather = async () => {
        if (!userLocation) return;
        try {
            console.log("🌦 Fetching Weather...");
            const response = await axios.get(`${BACKEND_URL}/api/weather`, {
                params: { lat: userLocation.lat, lon: userLocation.lon }
            });
            setWeather(response.data);
        } catch (error) {
            console.error("❌ Error fetching weather:", error);
        }
    };

    // 🌍 **Fetch Earthquake Data**
    const fetchEarthquakeData = async () => {
        if (!userLocation) return;
        try {
            console.log("🌍 Fetching Earthquakes...");
            const response = await axios.get(`${BACKEND_URL}/api/earthquake`, {
                params: { lat: userLocation.lat, lon: userLocation.lon }
            });
            setEarthquakes(response.data.features || []);
        } catch (error) {
            console.error("❌ Error fetching earthquake data:", error);
        }
    };

    // 🛰 **Fetch NASA Satellite Image**
    const fetchNasaImage = async () => {
        if (!userLocation) return;
        try {
            console.log("🛰 Fetching NASA Image...");
            const response = await axios.get(`${BACKEND_URL}/api/nasa`, {
                params: { lat: userLocation.lat, lon: userLocation.lon }
            });
            setNasaImage(response.data.url);
        } catch (error) {
            console.error("❌ Error fetching NASA image:", error);
        }
    };

    // 🚨 **Fetch Reported Disasters**
    const fetchDisasters = async () => {
        try {
            console.log("🚨 Fetching Reported Disasters...");
            const response = await axios.get(`${BACKEND_URL}/api/reports`);
            setDisasters(response.data);
        } catch (error) {
            console.error("❌ Error fetching disasters:", error);
        }
    };

    // 🤖 **Fetch AI Disaster Risk Prediction**
    const fetchRiskPrediction = async () => {
        if (!userLocation) return;
        try {
            console.log("🤖 Fetching AI Prediction...");
            const response = await axios.post(`${BACKEND_URL}/api/predict`, {
                lat: userLocation.lat,
                lon: userLocation.lon
            });
            setRiskLevel(response.data.riskLevel);
        } catch (error) {
            console.error("❌ Error fetching AI prediction:", error);
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
                <DisasterMap disasters={disasters} userLocation={userLocation} earthquakes={earthquakes} weather={weather} />
                <div className="col-span-1 md:col-span-2">
                    <h2 className="text-xl font-bold mb-4">🌦 Weather</h2>
                    {weather ? <p>{weather.weather[0].description}, Temp: {weather.main.temp}°C</p> : <p>Loading...</p>}
                </div>
                <CommunityForum />
                <EmergencyContacts userLocation={userLocation} />
                <SubscribeAlert />
                <DisasterList disasters={disasters} />
            </div>
        </div>
    );
};

export default App;
