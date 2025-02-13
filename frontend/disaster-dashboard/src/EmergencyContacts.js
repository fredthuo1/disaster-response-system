import React, { useState, useEffect } from "react";
import axios from "axios";

const EmergencyContacts = ({ userLocation }) => {
    const [hospitals, setHospitals] = useState([]);

    useEffect(() => {
        if (userLocation) fetchNearbyHospitals();
    }, [userLocation]);

    const fetchNearbyHospitals = async () => {
        try {
            console.log("🏥 Fetching Nearby Hospitals...");
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/hospitals`, {
                params: { lat: userLocation.lat, lon: userLocation.lon }
            });
            setHospitals(response.data.results || []);
        } catch (error) {
            console.error("⚠️ Error fetching hospitals:", error);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">🏥 Nearby Hospitals</h2>
            <ul>
                {hospitals.length > 0 ? (
                    hospitals.map((hospital, index) => (
                        <li key={index} className="mb-2">
                            {hospital.name} - {hospital.vicinity}
                        </li>
                    ))
                ) : (
                    <p>No hospitals found nearby.</p>
                )}
            </ul>
        </div>
    );
};

export default EmergencyContacts;
