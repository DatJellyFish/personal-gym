import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppDataProvider } from './lib/AppDataContext';
import { RestTimerProvider } from './lib/RestTimerContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Routines from './pages/Routines';
import History from './pages/History';
import Profile from './pages/Profile';
import ActiveSession from './pages/ActiveSession';

export default function App() {
  return (
    <BrowserRouter>
      <AppDataProvider>
        <RestTimerProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/rotinas" element={<Routines />} />
              <Route path="/historico" element={<History />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/sessao/:id" element={<ActiveSession />} />
            </Route>
          </Routes>
        </RestTimerProvider>
      </AppDataProvider>
    </BrowserRouter>
  );
}
