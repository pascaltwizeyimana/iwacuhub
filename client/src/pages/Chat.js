import { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

const socket = io("http://localhost:5000");

export default function Chat() {
  const { user } = useContext(AuthContext);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [receiverId, setReceiverId] = useState("");

  useEffect(() => {
    if (!user) return;

    socket.emit("join", user.id);

    socket.on("receive_private_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => socket.off("receive_private_message");
  }, [user]);

  const sendMessage = () => {
    if (!message || !receiverId) return;

    socket.emit("private_message", {
      senderId: user.id,
      receiverId,
      text: message,
    });

    setChat((prev) => [...prev, { text: message, senderId: user.id }]);
    setMessage("");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="pt-16 max-w-md mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Private Chat</h1>

        {/* Receiver input */}
        <input
          type="text"
          placeholder="Enter receiver user ID"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="w-full border p-2 mb-2"
        />

        {/* Chat box */}
        <div className="bg-white h-80 overflow-y-auto p-2 border">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`mb-2 ${
                msg.senderId === user.id ? "text-right" : "text-left"
              }`}
            >
              <span className="bg-rwandaBlue text-white px-2 py-1 rounded">
                {msg.text}
              </span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex mt-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border p-2"
            placeholder="Type message..."
          />
          <button
            onClick={sendMessage}
            className="bg-rwandaGreen text-white px-4"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}