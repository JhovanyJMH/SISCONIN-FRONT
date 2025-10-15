import React from 'react';
import { useSelector } from 'react-redux';
import DashboardGreeting from '../components/DashboardGreeting';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <DashboardGreeting name={user?.name || "ADMINISTRADOR"} />
      {/* Aquí puedes agregar más componentes del dashboard */}
    </div>
  );
};

export default DashboardPage; 