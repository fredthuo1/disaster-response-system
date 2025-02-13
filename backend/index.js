const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// ✅ Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://disaster-response-system-alpha.vercel.app", "http://localhost:3000"], 
        methods: ["GET", "POST"]
    }
});

// ✅ Middleware
app.use(express.json());
app.use(cors({
    origin: ["https://disaster-response-system-alpha.vercel.app", "http://localhost:3000"], 
    allowedHeaders: ["Content-Type"]
}));

// ✅ **Load Firebase Credentials from ENV**
const firebaseConfigBase64 = process.env.FIREBASE_CREDENTIALS_BASE64;
if (!firebaseConfigBase64) {
    console.error("⚠️ Firebase credentials missing! Set FIREBASE_CREDENTIALS_BASE64 in Vercel.");
    process.exit(1);
}
const firebaseConfig = JSON.parse(Buffer.from(firebaseConfigBase64, "base64").toString("utf8"));

// ✅ **Initialize Firebase**
admin.initializeApp({ credential: admin.credential.cert(firebaseConfig) });
const db = admin.firestore();

// 🛠 **Utility: Log API Requests**
const logRequest = (route, params) => {
    console.log(`[${new Date().toISOString()}] 🔍 Request to ${route}`);
    console.log(`   📌 Params:`, params);
};

// 🏙 **Reverse Geocoding: Convert Lat/Lon to City Name**
const getCityFromCoordinates = async (lat, lon) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;
        console.log(`🔄 Fetching city for lat: ${lat}, lon: ${lon}`);
        const response = await axios.get(url);
        if (response.data.results.length > 0) {
            const city = response.data.results[0].address_components.find(c => c.types.includes("locality"));
            console.log(`✅ City Found: ${city ? city.long_name : "Unknown City"}`);
            return city ? city.long_name : "Unknown City";
        }
        return "Unknown City";
    } catch (error) {
        console.error("⚠️ Reverse Geocoding Error:", error.message);
        return "Unknown City";
    }
};

// 🌦 **Weather API - Fetch Weather Data**
app.get("/api/weather", async (req, res) => {
    logRequest("/api/weather", req.query);
    try {
        let { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        console.log("✅ Weather Data:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("⚠️ Weather API Error:", error.message);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

// 🌍 **Earthquake API - Fetch Nearby Earthquakes**
app.get("/api/earthquake", async (req, res) => {
    logRequest("/api/earthquake", req.query);
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }
        const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=500&limit=5`;
        const response = await axios.get(url);
        console.log("✅ Earthquake Data:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("⚠️ Earthquake API Error:", error.message);
        res.status(500).json({ error: "Failed to fetch earthquake data" });
    }
});

// 🔥 **Store User-Reported Disasters**
app.post("/api/report", async (req, res) => {
    logRequest("/api/report", req.body);
    try {
        const { location, disasterType, severity, lat, lon } = req.body;
        if (!lat || !lon) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }
        const report = await db.collection("disasters").add(req.body);
        io.emit("new_disaster", req.body);
        console.log("✅ Disaster Reported:", req.body);
        res.json({ message: "Disaster report stored", id: report.id });
    } catch (error) {
        console.error("⚠️ Error storing report:", error.message);
        res.status(500).json({ error: "Failed to store report" });
    }
});

// 📢 **Fetch All Disaster Reports**
app.get("/api/reports", async (req, res) => {
    logRequest("/api/reports", {});
    try {
        const reportsSnapshot = await db.collection("disasters").get();
        const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("✅ Disaster Reports Fetched");
        res.json(reports);
    } catch (error) {
        console.error("⚠️ Error fetching reports:", error.message);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});

// 🏥 **Fetch Nearby Hospitals**
app.get("/api/hospitals", async (req, res) => {
    logRequest("/api/hospitals", req.query);
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: "Latitude and Longitude are required" });
        }
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=hospital&key=${apiKey}`;
        const response = await axios.get(url);
        console.log("✅ Nearby Hospitals Fetched");
        res.json(response.data);
    } catch (error) {
        console.error("⚠️ Error fetching hospitals:", error.message);
        res.status(500).json({ error: "Failed to fetch hospital data" });
    }
});

// 🔄 **WebSocket for Real-Time Updates**
io.on("connection", (socket) => {
    console.log(`[${new Date().toISOString()}] 🟢 New client connected`);
    socket.on("disconnect", () => {
        console.log(`[${new Date().toISOString()}] 🔴 Client disconnected`);
    });
});

// 🚀 **Start Server**
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
