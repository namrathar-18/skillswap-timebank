import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BrowseSkills from './pages/BrowseSkills.jsx';
import SkillDetail from './pages/SkillDetail.jsx';
import CreateSkill from './pages/CreateSkill.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Sessions from './pages/Sessions.jsx';
import Messages from './pages/Messages.jsx';
import Profile from './pages/Profile.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/skills" element={<BrowseSkills />} />
          <Route path="/skills/:id" element={<SkillDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/users/:id" element={<Profile />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skills/new"
            element={
              <ProtectedRoute>
                <CreateSkill />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:userId"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <ChatWidget />
    </div>
  );
}
