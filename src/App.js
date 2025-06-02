// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import PrivateRoute from './components/auth/PrivateRoute';
import Profile from './components/Profile';
import MyListings from './components/MyListings';
import Search from './components/Search';
import PetDetail from './components/PetDetail';
import AddPet from './components/AddPet';
import PetGuide from './components/guide/PetGuide';
import PetGuideArticle from './components/guide/PetGuideArticle';
import About from './components/About';
import Contact from './components/Contact';
import FAQ from './components/FAQ';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/search" element={<Search />} />
        <Route path="/pets/:id" element={<PetDetail />} />
        <Route path="/pet-guide" element={<PetGuide />} />
        <Route path="/pet-guide/:articleId" element={<PetGuideArticle />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Protected Routes */}
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/my-listings" element={
          <PrivateRoute>
            <MyListings />
          </PrivateRoute>
        } />
        <Route path="/add-pet" element={
          <PrivateRoute>
            <AddPet />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
