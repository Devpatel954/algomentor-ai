import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import Progress from './pages/Progress';
import Roadmap from './pages/Roadmap';
import Patterns from './pages/Patterns';
import InterviewSimulator from './pages/InterviewSimulator';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/patterns" element={<Patterns />} />
            <Route path="/simulator" element={<InterviewSimulator />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

