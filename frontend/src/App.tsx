import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { WorkoutsPage } from './pages/WorkoutsPage.js';
import { NutritionPage } from './pages/NutritionPage.js';
import { ProgressPage } from './pages/ProgressPage.js';
import { AiFormPage } from './pages/AiFormPage.js';
import { InsightsPage } from './pages/InsightsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="workouts" element={<WorkoutsPage />} />
          <Route path="nutrition" element={<NutritionPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="ai-form" element={<AiFormPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
