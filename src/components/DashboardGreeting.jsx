import React from 'react';
import { useSelector } from 'react-redux';
import NavigationCards from './NavigationCards';
import DashboardEquiposRentados from './inventarios/DashboardEquiposRentados';
import DashboardEquiposGEM from './inventarios/DashboardEquiposGEM';

const DashboardGreeting = () => {
  const hours = new Date().getHours();
  let greetings = '';

  if (hours >= 6 && hours <= 11) {
    greetings = 'Buenos días';
  } else if (hours > 11 && hours <= 18) {
    greetings = 'Buenas tardes';
  } else {
    greetings = 'Buenas noches';
  }

  const { user } = useSelector(state => state.auth);

  return (
    <div className="relative bg-orange-100 p-4 sm:p-6 rounded-sm overflow-hidden mb-8">
      {/* Background illustration: Laptop SVG */}
      <div className="absolute right-0 top-5 -mt-4 mr-16 pointer-events-none hidden xl:block" aria-hidden="true">
        <svg width="240" height="100" viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Degradado plateado para gabinete y monitor */}
            <linearGradient id="metallicSilver" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc"/>
              <stop offset="40%" stopColor="#d1d5db"/>
              <stop offset="70%" stopColor="#e5e7eb"/>
              <stop offset="100%" stopColor="#cbd5e1"/>
            </linearGradient>
            <linearGradient id="screenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bae6fd"/>
              <stop offset="100%" stopColor="#38bdf8"/>
            </linearGradient>
          </defs>
          {/* Gabinete de PC */}
          <rect x="10" y="30" width="50" height="60" rx="6" fill="url(#metallicSilver)" stroke="#94a3b8" strokeWidth="2"/>
          <rect x="20" y="40" width="30" height="30" rx="3" fill="#f1f5f9" stroke="#5e7e87" strokeWidth="1.5"/>
          <circle cx="35" cy="80" r="4" fill="#5e7e87"/>
          <rect x="28" y="75" width="14" height="2" rx="1" fill="#5e7e87"/>
          {/* Monitor */}
          <rect x="90" y="25" width="100" height="50" rx="6" fill="url(#metallicSilver)" stroke="#94a3b8" strokeWidth="2"/>
          <rect x="102" y="35" width="76" height="30" rx="3" fill="url(#screenGradient)" stroke="#38bdf8" strokeWidth="1.5"/>
          {/* Base del monitor en plateado */}
          <rect x="125" y="77" width="50" height="6" rx="2" fill="url(#metallicSilver)"/>
          <rect x="145" y="83" width="10" height="4" rx="2" fill="url(#metallicSilver)"/>
          {/* Letras DELL */}
          <text x="120" y="60" fontSize="8" fontFamily="Arial, Helvetica, sans-serif" fill="#2563eb" fontWeight="bold">SISCONIN</text>
          {/* Teclado */}
          <rect x="110" y="90" width="60" height="8" rx="2" fill="url(#metallicSilver)" stroke="#94a3b8" strokeWidth="1.5"/>
          <rect x="120" y="93" width="10" height="2" rx="1" fill="#38bdf8"/>
          <rect x="135" y="93" width="10" height="2" rx="1" fill="#38bdf8"/>
          <rect x="150" y="93" width="10" height="2" rx="1" fill="#38bdf8"/>
          <rect x="165" y="93" width="10" height="2" rx="1" fill="#38bdf8"/>
          {/* Mouse */}
          <ellipse cx="220" cy="60" rx="10" ry="18" fill="url(#metallicSilver)" stroke="#94a3b8" strokeWidth="2"/>
          <rect x="218" y="52" width="4" height="10" rx="2" fill="#2563eb"/>
          <line x1="220" y1="42" x2="220" y2="52" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative">
        <h1 className="text-2xl md:text-3xl text-slate-800 font-bold mb-1">{greetings}, {user?.name}. 👋</h1>
        <p>¿Qué es lo que vamos a hacer hoy?</p>
      </div>

      <NavigationCards />
      {user?.profile === '1' && (
        <>
          <DashboardEquiposGEM />
          <DashboardEquiposRentados />
        </>
      )}
    </div>
  );
};

export default DashboardGreeting; 