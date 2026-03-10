import { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PhonePreview } from './components/PhonePreview';
import type { ProfileData, DashboardMode } from './types';
import './App.css';

function App() {
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('standard');
  const [profileData, setProfileData] = useState<ProfileData>({
    title: 'The Storyteller',
    subtitle: 'Based on your vocal frequency profile',
    looksmaxxingRating: 'Chad',
    avatarImage: null,
    avatarScale: 1,
    avatarOffsetX: 0,
    avatarOffsetY: 0,
    authorityScore: 52,
    vocalAgeScore: 18,
    potentialScore: 80,
    baselineFrequency: 136,
    voiceClassification: 'Baritone',
    depthRating: 'Medium',
    trainingStatus: 'Inactive',

    // Blackpill Specifics (Hz Focused)
    hzValue: '85',
    percentile: 'Top 1%',
    masculinityScore: 99,
    cortisolLevel: 'Low',
    ratingSubtitle: "Its over buddy",
    useIphoneFrame: false
  });

  return (
    <div className="app-container">
      <div className="left-panel">
        <ControlPanel
          data={profileData}
          onChange={setProfileData}
          mode={dashboardMode}
          onModeChange={setDashboardMode}
        />
      </div>
      <div className="right-panel">
        <div className="preview-container">
          <PhonePreview data={profileData} mode={dashboardMode} />
        </div>
      </div>
    </div>
  );
}

export default App;
