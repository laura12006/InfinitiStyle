import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Explorar from './pages/Explorar'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Verify from './pages/Verify'
import ForgotPassword from './pages/ForgotPassword'
import AdminPanel from './pages/AdminPanel'
import Wishlist from './pages/Wishlist'
import Publications from './components/Publications'
import CreatePublication from './components/CreatePublication'
import PublicationDetail from './pages/PublicationDetail'
import EditPublication from './pages/EditPublication'
import UserProfile from './pages/UserProfile'
import MyTransactions from './pages/MyTransactions'
import Navbar from './components/Navbar'
import TestStyles from './components/TestStyles'
import FloatingChat from './components/FloatingChat'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/explorar' element={<Explorar/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/register' element={<Register/>} />
          <Route path='/profile' element={<Profile/>} />
          <Route path='/verify' element={<Verify/>} />
          <Route path='/forgot-password' element={<ForgotPassword/>} />
          <Route path='/admin' element={<AdminPanel/>} />
          <Route path='/wishlist' element={<Wishlist/>} />
          <Route path='/publications' element={<Publications/>} />
          <Route path='/publications/create' element={<CreatePublication/>} />
          <Route path='/publications/:id' element={<PublicationDetail/>} />
          <Route path='/publications/:id/edit' element={<EditPublication/>} />
          <Route path='/user/:userId' element={<UserProfile/>} />
          <Route path='/transactions' element={<MyTransactions/>} />
         <Route path='/test-styles' element={<TestStyles/>} />
        </Routes>
      </main>
      
      {/* Chat flotante - aparece en todas las páginas */}
      <FloatingChat />
    </div>
  )
}
