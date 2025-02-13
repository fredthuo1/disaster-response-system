import React, { useState } from "react";
import axios from "axios";

const SubscribeAlert = () => {
    const [phone, setPhone] = useState("");

    const subscribe = async () => {
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/subscribe`, { phone });
        alert("Subscribed to alerts!");
    };

    return (
        <div>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
            <button onClick={subscribe}>Subscribe</button>
        </div>
    );
};

export default SubscribeAlert;
