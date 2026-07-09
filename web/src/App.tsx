import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkoutsProvider } from './lib/WorkoutsContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Plans from './pages/Plans';
import LogWorkout from './pages/LogWorkout';

export default function App() {
  return (
    <BrowserRouter>
      <WorkoutsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/registrar" element={<LogWorkout />} />
            <Route path="/treinos" element={<History />} />
            <Route path="/montar" element={<Plans />} />
          </Route>
        </Routes>
      </WorkoutsProvider>
    </BrowserRouter>
  );
}
