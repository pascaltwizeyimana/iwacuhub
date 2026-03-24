import { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

const socket = io("http://localhost:8000");

const rooms = ['rwanda-general', 'kigali-chat', 'friends'];

export default function Chat() {
  const { user } = useContext(AuthContext);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('rwanda-general');

  useEffect(() => {
    if (!user) return;

    socket.emit("join", user.id);

    socket.on("receive_private_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_private_message");
      socket.off("receive_message");
    };
  }, [user]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      room: currentRoom,
      text: message,
      sender: user.username || user.id,
      senderId: user.id
    });

    setChat((prev) => [...prev, { text: message, senderId: user.id, sender: user.username }]);
    setMessage("");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rwandaBlue to-rwandaGreen">
      <Navbar />

      <div className="pt-16 max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">🇷🇼 Iwacu Messenger</h1>

        {/* Room selector */}
        <div className="flex flex-wrap gap-2 mb-6 p-2 bg-white/10 rounded-lg">
          {rooms.map(room => (
            <button
              key={room}
              onClick={() => {
                socket.emit('join_room', room);
                setCurrentRoom(room);
                setChat([]);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                currentRoom === room 
                  ? 'bg-white text-rwandaBlue shadow-lg' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              #{room.replace(/-/g, ' ')}
            </button>
          ))}
        </div>

        {/* Chat box */}
        <div className="bg-white/20 backdrop-blur-xl h-96 rounded-2xl p-4 border border-white/30 overflow-y-auto mb-4">
          <div className="text-xs text-white/70 mb-2">Room: {currentRoom}</div>
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`mb-3 p-3 rounded-2xl ${
                msg.senderId === user.id 
                  ? "bg-rwandaBlue ml-auto max-w-xs" 
                  : "bg-white/80 text-black mr-auto max-w-xs"
              }`}
            >
              <div className="font-semibold text-sm">{msg.sender}</div>
              <div>{msg.text}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-white p-3 rounded-2xl border-none focus:ring-2 focus:ring-rwandaBlue"
            placeholder="Message Rwanda..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-white text-rwandaBlue px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

