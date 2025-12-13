import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import MedicationList from './pages/MedicationList';
import Dashboard from './pages/Dashboard';
import AddMedication from './pages/AddMedication';
import AddMeasurement from './pages/AddMeasurement';
import Progress from './pages/Progress';
import Support from './pages/Support';
import Specialists from './pages/support/Specialists';
import DataManagement from './pages/support/DataManagement';
import Settings from './pages/support/SettingsPage';
import CareRecipients from './pages/support/CareRecipients';
import EmergencyContacts from './pages/support/EmergencyContacts';
import UserProfile from './pages/support/UserProfile';
import SymptomTracker from './pages/tracker/SymptomTracker';
import ActivityTracker from './pages/tracker/ActivityTracker';
import TccAgenda from './pages/TccAgenda';
import HabitFrequency from './pages/psicoterapia/HabitFrequency';
import ThoughtRecord from './pages/psicoterapia/ThoughtRecord';
import CopingCards from './pages/psicoterapia/CopingCards';
import AbcRecord from './pages/psicoterapia/AbcRecord';
import './components/layout/Layout.css';

function App() {
  // Apply theme on load
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Get base path from environment or use default
  const basePath = import.meta.env.BASE_URL || '/';

  return (
    <BrowserRouter basename={basePath}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="medications" element={<MedicationList />} />
          <Route path="medications/add" element={<AddMedication />} />
          <Route path="measurements/add" element={<AddMeasurement />} />
          <Route path="progress" element={<Progress />} />
          <Route path="psicoterapia" element={<TccAgenda />} />
          <Route path="psicoterapia/habits" element={<HabitFrequency />} />
          <Route path="psicoterapia/thoughts" element={<ThoughtRecord />} />
          <Route path="psicoterapia/cards" element={<CopingCards />} />
          <Route path="psicoterapia/abc" element={<AbcRecord />} />
          <Route path="support" element={<Support />} />
          <Route path="support/specialists" element={<Specialists />} />
          <Route path="support/data" element={<DataManagement />} />
          <Route path="support/settings" element={<Settings />} />
          <Route path="support/care-recipients" element={<CareRecipients />} />
          <Route path="support/emergency" element={<EmergencyContacts />} />
          <Route path="support/profile" element={<UserProfile />} />
          <Route path="tracker/symptom" element={<SymptomTracker />} />
          <Route path="tracker/activity" element={<ActivityTracker />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
