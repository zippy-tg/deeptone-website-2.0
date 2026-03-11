import { useState, useEffect } from 'react';
import { AudioLines, Flame, Sparkles, SlidersHorizontal } from 'lucide-react';
import { ControlPanel } from './components/ControlPanel';
import { PhonePreview } from './components/PhonePreview';
import { SquareExportPreview } from './components/SquareExportPreview';
import type { ProfileData, DashboardMode } from './types';
import { extractTransparentLogo, imageToDataUri } from './utils/appStoreLogo';
import appIcon from './assets/app-icon.png';
import appStoreLogoBase from './assets/app-store-logo.webp';
import iphoneFrame from './assets/iphone-frame.png';
import './App.css';

function App() {
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('standard');
  const [hasSelectedMode, setHasSelectedMode] = useState(false);
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
    potentialRating: 'Chad',
    minimalHzColorStart: '#69a3ff',
    minimalHzColorEnd: '#a2d7ff',
    minimalPotentialColorStart: '#63a0ff',
    minimalPotentialColorEnd: '#2d6cff',
    minimalVocalAgeColorStart: '#8dd5ff',
    minimalVocalAgeColorEnd: '#4a97ff',
    minimalAvatarRingColorStart: '#d2e0ff',
    minimalAvatarRingColorEnd: '#2c69ff',
    authorityColorStart: '#ffffff',
    authorityColorEnd: '#d9d9d9',
    vocalAgeColorStart: '#72b4ff',
    vocalAgeColorEnd: '#2d6cff',
    potentialColorStart: '#3a78ff',
    potentialColorEnd: '#1a5fff',
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

  const [appStoreBadgeSrc, setAppStoreBadgeSrc] = useState<string | null>(null);
  const [appIconBase64, setAppIconBase64] = useState<string | null>(null);
  const [iphoneFrameBase64, setIphoneFrameBase64] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    extractTransparentLogo(appStoreLogoBase)
      .then((src) => {
        if (!cancelled) setAppStoreBadgeSrc(src);
      })
      .catch(() => {
        if (!cancelled) setAppStoreBadgeSrc(null);
      });

    imageToDataUri(appIcon)
      .then(uri => { if (!cancelled) setAppIconBase64(uri); })
      .catch(() => { if (!cancelled) setAppIconBase64(appIcon); });

    imageToDataUri(iphoneFrame)
      .then(uri => { if (!cancelled) setIphoneFrameBase64(uri); })
      .catch(() => { if (!cancelled) setIphoneFrameBase64(iphoneFrame); });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleModeSelect = (mode: DashboardMode) => {
    setDashboardMode(mode);
    setHasSelectedMode(true);
  };

  const handleBackToChooser = () => {
    setHasSelectedMode(false);
  };

  if (!hasSelectedMode) {
    return (
      <div className="mode-entry-screen">
        <div className="mode-entry-shell">
          <div className="mode-entry-copy">
            <p className="mode-entry-kicker">DEEptone</p>
            <h1>Creator Tools</h1>
            <p>Choose the template you want to open first.</p>
          </div>

          <div className="mode-entry-grid">
            <button
              type="button"
              className="mode-entry-card"
              onClick={() => handleModeSelect('standard')}
            >
              <span className="mode-entry-badge mode-entry-badge-recommended">Recommended</span>
              <div className="mode-entry-icon">
                <Sparkles size={28} />
              </div>
              <h2>Standard</h2>
              <p>Full profile template with scores, voice signature, and creator export tools.</p>
            </button>

            <button
              type="button"
              className="mode-entry-card"
              onClick={() => handleModeSelect('blackpill')}
            >
              <div className="mode-entry-icon">
                <Flame size={28} />
              </div>
              <h2>Blackpill</h2>
              <p>Hz-focused layout with masculinity score, percentile, and cortisol blocks.</p>
            </button>

            <button
              type="button"
              className="mode-entry-card"
              onClick={() => handleModeSelect('testVoice')}
            >
              <div className="mode-entry-icon">
                <AudioLines size={28} />
              </div>
              <h2>Test Voice</h2>
              <p>Quick record-style template built for test result screenshots and exports.</p>
            </button>

            <button
              type="button"
              className="mode-entry-card"
              onClick={() => handleModeSelect('minimal')}
            >
              <span className="mode-entry-badge mode-entry-badge-popular">Most Used</span>
              <div className="mode-entry-icon">
                <SlidersHorizontal size={28} />
              </div>
              <h2>Minimal</h2>
              <p>Clean stripped-down layout with Deeptone badge, Hz reading, looksmaxxing rating, and potential.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="left-panel">
        <ControlPanel
          data={profileData}
          onChange={setProfileData}
          mode={dashboardMode}
          onModeChange={setDashboardMode}
          modeLocked
          onBack={handleBackToChooser}
        />
      </div>
      <div className="right-panel">
        <div className="preview-container">
          <PhonePreview data={profileData} mode={dashboardMode} renderMode="live" />
        </div>
      </div>
      <div className="hidden-export-surface" aria-hidden="true">
        {/* Voodoo images to force decode and keep assets alive in mobile Safari */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none', display: 'flex' }}>
          {profileData.avatarImage && <img src={profileData.avatarImage} alt="" style={{ width: '1px', height: '1px' }} />}
          {appIconBase64 && <img src={appIconBase64} alt="" style={{ width: '1px', height: '1px' }} />}
          {appStoreBadgeSrc && <img src={appStoreBadgeSrc} alt="" style={{ width: '1px', height: '1px' }} />}
          {iphoneFrameBase64 && <img src={iphoneFrameBase64} alt="" style={{ width: '1px', height: '1px' }} />}
        </div>

        <PhonePreview
          data={profileData}
          mode={dashboardMode}
          exportId="phone-preview-export"
          renderMode="export"
        />
        <SquareExportPreview data={profileData} mode={dashboardMode} />
      </div>
    </div>
  );
}

export default App;
