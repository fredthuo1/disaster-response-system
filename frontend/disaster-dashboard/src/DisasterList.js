import React from "react";

const DisasterList = ({ disasters }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            {disasters.length === 0 ? (
                <p className="text-gray-500 text-center">No disasters reported yet.</p>
            ) : (
                <ul className="space-y-4">
                    {disasters.map((disaster, index) => (
                        <li
                            key={index}
                            className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-4">
                                {/* Disaster Type Icon */}
                                <span className="text-2xl">{getDisasterIcon(disaster.disasterType)}</span>
                                <div>
                                    <strong className="text-lg">{disaster.disasterType}</strong>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {disaster.location}
                                    </p>
                                </div>
                            </div>
                            {/* Severity Badge */}
                            <span className={`inline-block px-3 py-1 text-sm font-bold text-white rounded-md ${disaster.severity.toLowerCase() === "high" ? "bg-red-600" :
                                    disaster.severity.toLowerCase() === "medium" ? "bg-yellow-500" :
                                        "bg-green-500"
                                }`}>
                                {disaster.severity}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// Function to get appropriate icons for disaster types
const getDisasterIcon = (type) => {
    const icons = {
        "Fire": "🔥",
        "Flood": "🌊",
        "Tornado": "🌪",
        "Earthquake": "🌍",
        "Hurricane": "🌀",
        "Other": "⚠️"
    };
    return icons[type] || icons["Other"];
};

export default DisasterList;
