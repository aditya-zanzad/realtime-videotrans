import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { APP_ID, SERVER_SECRET } from '../components/Constant';
import io from 'socket.io-client';
import axios from 'axios'; // Import axios for API calls
import './Videopage.css';

// Replace this with your DeepL API Key
const DEEPL_API_KEY = 'YOUR_DEEPL_API_KEY'; 

// Establish socket connection
const socket = io.connect('http://localhost:5000'); // Replace with your server URL

const languageOptions = [
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Spanish' },
  { code: 'FR', label: 'French' },
  { code: 'HI', label: 'Hindi' },
  { code: 'MR', label: 'Marathi' },
  // Add more languages as needed
];

const Videopage = () => {
  const { id } = useParams();
  const roomID = id;
  const meetingRef = useRef(null); // Ref for the video container
  const [transcript, setTranscript] = useState(''); // Local state for storing transcript
  const [receivedTranscript, setReceivedTranscript] = useState(''); // State for received transcript
  const [selectedLanguage, setSelectedLanguage] = useState('EN'); // State for selected language
  const [translatedText, setTranslatedText] = useState(''); // State for translated text
  const [micOn, setMicOn] = useState(false); // State to manage microphone status

  useEffect(() => {
    const initMeeting = async () => {
      const appID = APP_ID;
      const serverSecret = SERVER_SECRET;

      // Generate Kit Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, Date.now().toString(), 'aditya-zanzad');

      // Create instance object from Kit Token
      const zp = ZegoUIKitPrebuilt.create(kitToken);

      // Start the call
      zp.joinRoom({
        container: meetingRef.current, // Use the ref for container
        sharedLinks: [
          {
            name: 'Personal link',
            url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference, // Video conference mode
        },
      });
    };

    initMeeting(); // Call the async function to initialize the meeting

    // Join the room on the server
    socket.emit('joinRoom', roomID); // Join the room with the room ID

    let recognition;

    if (micOn) {
      // Voice-to-text setup using Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage.toLowerCase(); // Set language based on user selection

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece;
          }
        }
        setTranscript(finalTranscript); // Update the local transcript state
        socket.emit('sendTranscript', { roomID, transcript: finalTranscript }); // Send transcript to server
      };

      recognition.start(); // Start speech recognition
    }

    // Receive transcript from the server
    socket.on('receiveTranscript', (data) => {
      setReceivedTranscript(data.transcript); // Display the received transcript
      translateText(data.transcript); // Translate received transcript
    });

    return () => {
      if (recognition) recognition.stop(); // Stop speech recognition when component unmounts
      socket.off('receiveTranscript'); // Clean up the socket listener
    };

  }, [roomID, selectedLanguage, micOn]); // Reinitialize when language or mic status changes

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value); // Update selected language
  };

  const handleMicToggle = () => {
    setMicOn((prevState) => !prevState); // Toggle the mic status
  };

  const translateText = async (text) => {
    try {
      const response = await axios.post(
        'https://api-free.deepl.com/v2/translate',
        new URLSearchParams({
          auth_key: DEEPL_API_KEY,
          text: text,
          target_lang: selectedLanguage,
        })
      );
      setTranslatedText(response.data.translations[0].text); // Set the translated text
    } catch (error) {
      console.error('Error during translation:', error);
    }
  };

  return (
    <div className="videopage-container">
      <div ref={meetingRef} className="video-container"></div> {/* Container for the meeting */}
      <div className="transcript-container">
        <h2>Voice to Text Transcript</h2>
        <label htmlFor="language-select" className="language-label">Select Language:</label>
        <select id="language-select" value={selectedLanguage} onChange={handleLanguageChange}>
          {languageOptions.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
        <p>Sender Transcript: {transcript}</p> {/* Display the local transcribed text */}
        <p>
          Received Transcript:
          <p className='received'> {receivedTranscript}</p> {/* Display the received transcript from other participants */}
        </p>
        <div className="toggle-container">
  <label className="switch">
    <input type="checkbox" checked={micOn} onChange={handleMicToggle} />
    <span className="slider round"></span>
  </label>
  <span>{micOn ? 'Mic On' : 'Mic Off'}</span>
</div>

         {/* Button to toggle the mic */}
      </div>
    </div>
  );
};

export default Videopage;
