import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <BrowserRouter>
      {/* 1. مزود المصادقة والجلسة (Auth Context) */}
      <AuthProvider>
        {/* 2. مزود حالة الموقع الجغرافي بالدبوس */}
        <LocationProvider>
          {/* 3. مزود سلة المشتريات ومحرك تضارب المطاعم */}
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
