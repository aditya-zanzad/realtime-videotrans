import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCode } from 'react-qrcode-logo'; // Ensure you have installed this library
import './Homepage.css'; // Add custom styles here

const Homepage = () => {
    const [input, setInput] = useState('');
    const [meetingId, setMeetingId] = useState('');
    const [showQRCode, setShowQRCode] = useState(false);
    const [directLink, setDirectLink] = useState('');
    const navigate = useNavigate();

    // Function to generate a random meeting ID
    const generateRandomId = () => {
        return Math.random().toString(36).substr(2, 9); // Generate random 9 character string
    };

    // Handle form submission for creating a meeting
    const createMeeting = () => {
        const randomId = generateRandomId();  // Generate a random meeting ID
        setMeetingId(randomId);  // Store the random ID
        setShowQRCode(true);  // Show the QR code
    };

    // Handle form submission for direct link
    const joinDirectMeeting = () => {
        if (directLink.trim()) {
            navigate(`/room/${directLink}`); // Navigate to the room with the provided link
        } else {
            alert("Please enter a valid meeting link");
        }
    };

    // Handle form submission for joining meeting
    const submithandler = () => {
        if (input.trim()) {
            navigate(`/room/${meetingId}`); // Navigate to the room with the random ID
        } else {
            alert("Please enter a valid name");
        }
    };

    return (
        <div className="homepage-container">
            <h1>Join a Meeting</h1>
            <div className="columns-container">
                {/* Section for creating a new meeting */}
                <div className="create-meeting-column">
                    <h2>Create Meeting</h2>
                    <div className="meeting-form">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="input-field"
                        />
                        <button
                            onClick={createMeeting}
                            className="join-button"
                        >
                            Create Meeting
                        </button>
                    </div>

                    {showQRCode && (
                        <div className="qr-code-container">
                            <h3>Scan the QR code to join the meeting</h3>
                            <QRCode
                                value={`http://localhost:5173/room/${meetingId}`} // Replace with your domain
                                size={256}
                            />
                            <p>Meeting ID: {meetingId}</p>
                            <button
                                onClick={submithandler}
                                className="join-button"
                            >
                                Join Meeting
                            </button>
                        </div>
                    )}
                </div>

                {/* Section for joining using a direct link */}
                <div className="join-link-column">
                    <h2>Join by Link</h2>
                    <div className="link-form">
                        <input
                            type="text"
                            placeholder="Paste or enter meeting link"
                            value={directLink}
                            onChange={(e) => setDirectLink(e.target.value)}
                            className="input-field"
                        />
                        <button
                            onClick={joinDirectMeeting}
                            className="join-button"
                        >
                            Join Meeting
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homepage;
