import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * AuthLayout
 * Full-page responsive container for split-screen authentication flows (Login, Register Customer, Register Vendor)
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-paper font-readex flex flex-col">
      <Outlet />
    </div>
  );
}
