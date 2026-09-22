import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Auth from './pages/Auth'
import Orders from './pages/Orders'
import Admin from './pages/Admin'
import './styles.css'

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </StoreProvider>
    </BrowserRouter>
  )
}
