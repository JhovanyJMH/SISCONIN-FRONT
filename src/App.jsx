import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import EquiposGEMList from './components/inventarios/EquiposGEMList';
import EquiposRentadosList from './components/inventarios/EquiposRentadosList';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
