import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, HeatmapLayer } from "@react-google-maps/api";
import axios from "axios";

const mapContainerStyle = { width: "100%", height: "600px", borderRadius: "10px" };
const libraries = ["places", "visualization"];

const DisasterMap = ({ disasters, userLocation }) => {
    const [weather, setWeather] = useState(null);
    const [earthquakes, setEarthquakes] = useState([]);
    const [validUserLocation, setValidUserLocation] = useState(null);

    useEffect(() => {
        if (userLocation && !isNaN(userLocation.lat) && !isNaN(userLocation.lon)) {
            setValidUserLocation({
                lat: parseFloat(userLocation.lat),
                lng: parseFloat(userLocation.lon),
            });
        } else {
            console.warn("⚠️ Invalid user location detected. Defaulting to San Francisco.");
            setValidUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
    }, [userLocation]);

    useEffect(() => {
        if (validUserLocation) {
            fetchWeather();
            fetchEarthquakes();
        }
    }, [validUserLocation]);

    const fetchWeather = async () => {
        if (!validUserLocation) return;
        try {
            console.log("🌦 Fetching Weather for:", validUserLocation.lat, validUserLocation.lng);
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/weather`, {
                params: { lat: validUserLocation.lat, lon: validUserLocation.lng }
            });

            if (response.data && response.data.coord) {
                setWeather(response.data);
                console.log("✅ Weather Data:", response.data);
            } else {
                console.warn("⚠️ Invalid weather data:", response.data);
            }
        } catch (error) {
            console.error("❌ Error fetching weather:", error);
        }
    };

    const fetchEarthquakes = async () => {
        if (!validUserLocation) return;
        try {
            console.log("🌍 Fetching Earthquakes near:", validUserLocation.lat, validUserLocation.lng);
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/earthquake`, {
                params: { lat: validUserLocation.lat, lon: validUserLocation.lng }
            });

            if (response.data.features && response.data.features.length > 0) {
                setEarthquakes(response.data.features);
                console.log("✅ Earthquake Data:", response.data.features);
            } else {
                console.warn("⚠️ No earthquakes found:", response.data);
            }
        } catch (error) {
            console.error("❌ Error fetching earthquake data:", error);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg col-span-2">
            {!validUserLocation ? (
                <div className="flex justify-center items-center h-60">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                </div>
            ) : (
                    <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY} libraries={libraries}>
                    <GoogleMap mapContainerStyle={mapContainerStyle} center={validUserLocation} zoom={8}>
                        {/* 📍 User Location Marker */}
                        <Marker position={validUserLocation} title="Your Location" />

                        {/* 🔥 Heatmap for Disaster-Prone Areas */}
                        <HeatmapLayer
                            data={disasters
                                .filter((disaster) => !isNaN(disaster.lat) && !isNaN(disaster.lng))
                                .map((disaster) => new window.google.maps.LatLng(disaster.lat, disaster.lng))}
                            options={{ radius: 20, opacity: 0.6 }}
                        />

                        {/* 📍 Disaster Reports */}
                        {disasters.map((disaster, index) =>
                            !isNaN(disaster.lat) && !isNaN(disaster.lng) ? (
                                <Marker key={index} position={{ lat: disaster.lat, lng: disaster.lng }} title={disaster.disasterType} />
                            ) : null
                        )}

                        {/* 🌦 Weather Marker */}
                        {weather && weather.coord ? (
                            <Marker
                                position={{ lat: weather.coord.lat, lng: weather.coord.lon }}
                                icon={{ url: `http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`, scaledSize: new window.google.maps.Size(60, 60) }}
                                title={`Weather: ${weather.weather[0].description}, ${weather.main.temp}°C`}
                            />
                        ) : null}

                        {/* 🌍 Earthquake Markers */}
                        {earthquakes.map((eq, index) =>
                            !isNaN(eq.geometry.coordinates[1]) && !isNaN(eq.geometry.coordinates[0]) ? (
                                <Marker
                                    key={index}
                                    position={{ lat: eq.geometry.coordinates[1], lng: eq.geometry.coordinates[0] }}
                                    icon={{
                                        url: getEarthquakeIcon(eq.properties.mag),
                                        scaledSize: new window.google.maps.Size(50, 50),
                                    }}
                                    title={`Earthquake: ${eq.properties.place} - Magnitude: ${eq.properties.mag}`}
                                />
                            ) : null
                        )}
                    </GoogleMap>
                </LoadScript>
            )}
        </div>
    );
};

// 🔥 Function to determine Earthquake Marker color based on magnitude
const getEarthquakeIcon = (magnitude) => {
    if (magnitude < 4) return "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
    if (magnitude < 6) return "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    return "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
};

export default DisasterMap;
