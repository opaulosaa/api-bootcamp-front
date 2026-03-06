import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import CreateOffer from './pages/CreateOffer'
import Offers from './pages/Offers'
import EditOffer from './pages/EditOffer'
import OfferDetails from './pages/OfferDetails'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import AdminPanel from './pages/AdminPanel'
import LandingPage from './pages/LandingPage'
import Knowledge from './pages/Knowledge'
import './App.css'

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/register' || 
                     location.pathname === '/login' || 
                     location.pathname === '/forgot-password' || 
                     location.pathname === '/reset-password';

  return (
    <div className="App">
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/create-offer" element={
          <PrivateRoute>
            <CreateOffer />
          </PrivateRoute>
        } />
        <Route path="/offers" element={<Offers />} />
        <Route path="/offer-details/:id" element={<OfferDetails />} />
        <Route path="/edit-offer/:id" element={<EditOffer />} />
        <Route path="/messages" element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
      </Routes>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
