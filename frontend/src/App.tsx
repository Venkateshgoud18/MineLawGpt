import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MiningLaws from './pages/MiningLaws';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mining-laws" element={<MiningLaws />} />
      </Routes>
    </Router>
  );
}

export default App;
