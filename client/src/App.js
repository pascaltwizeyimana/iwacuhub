import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";

// Simple test components
function Home() { return <div style={{padding:20}}>🏠 Home Page - Working!</div>; }
function Login() { return <div style={{padding:20}}>🔐 Login Page</div>; }
function Register() { return <div style={{padding:20}}>📝 Register Page</div>; }
function Upload() { return <div style={{padding:20}}>📤 Upload Page</div>; }
function Profile() { return <div style={{padding:20}}>👤 Profile Page</div>; }
function Chat() { return <div style={{padding:20}}>💬 Chat Page</div>; }
function Reels() { return <div style={{padding:20}}>🎬 Reels Page</div>; }
function Videos() { return <div style={{padding:20}}>📹 Videos Page</div>; }

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div>
          <h1>🇷🇼 IwacuHub Rwanda Super App</h1>
          <nav style={{marginBottom:20}}>
            <a href="/" style={{marginRight:10}}>Home</a>
            <a href="/login" style={{marginRight:10}}>Login</a>
            <a href="/register" style={{marginRight:10}}>Register</a>
            <a href="/upload" style={{marginRight:10}}>Upload</a>
            <a href="/profile" style={{marginRight:10}}>Profile</a>
            <a href="/chat" style={{marginRight:10}}>Chat</a>
            <a href="/reels" style={{marginRight:10}}>Reels</a>
            <a href="/videos" style={{marginRight:10}}>Videos</a>
          </nav>
          <Routes>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/reels" element={<PrivateRoute><Reels /></PrivateRoute>} />
            <Route path="/videos" element={<PrivateRoute><Videos /></PrivateRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;