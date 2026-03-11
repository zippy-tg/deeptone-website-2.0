import { useEffect, useId, useMemo, useState } from 'react';
import type { ProfileData, DashboardMode } from '../types';
import { Book, Activity, Mic2, ArrowDownToLine, Zap } from 'lucide-react';
import { renderCroppedAvatar } from '../utils/avatarCrop';
import { extractTransparentLogo } from '../utils/appStoreLogo';
import { hexToRgba } from '../utils/color';
import appIcon from '../assets/app-icon.png';
import appStoreLogoBase from '../assets/app-store-logo.webp';
import iphoneFrame from '../assets/iphone-frame.png';

const AppleLogo = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 384 512" fill="currentColor" className="apple-logo-icon" aria-hidden="true">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
);

interface PhonePreviewProps {
    data: ProfileData;
    mode: DashboardMode;
    exportId?: string;
    renderMode?: 'live' | 'export';
}

export function PhonePreview({ data, mode, exportId, renderMode = 'live' }: PhonePreviewProps) {
    const previewWidth = data.useIphoneFrame ? 380 : 450;
    const isBlackpill = mode === 'blackpill';
    const isMinimal = mode === 'minimal';
    const isExportRender = renderMode === 'export';
    const [renderedAvatar, setRenderedAvatar] = useState<string | null>(data.avatarImage);
    const [appStoreBadgeSrc, setAppStoreBadgeSrc] = useState<string | null>(null);
    const [viewportWidth, setViewportWidth] = useState(() => (
        typeof window === 'undefined' ? 1440 : window.innerWidth
    ));

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let cancelled = false;

        if (!data.avatarImage) {
            setRenderedAvatar(null);
            return;
        }

        renderCroppedAvatar(
            data.avatarImage,
            data.avatarScale,
            data.avatarOffsetX,
            data.avatarOffsetY
        )
            .then((src) => {
                if (!cancelled) {
                    setRenderedAvatar(src);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setRenderedAvatar(data.avatarImage);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [data.avatarImage, data.avatarScale, data.avatarOffsetX, data.avatarOffsetY]);

    useEffect(() => {
        let cancelled = false;

        extractTransparentLogo(appStoreLogoBase)
            .then((src) => {
                if (!cancelled) {
                    setAppStoreBadgeSrc(src);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setAppStoreBadgeSrc(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const hzCircleSize = isBlackpill
        ? (data.useIphoneFrame ? 138 : 148)
        : 160;
    const hzProgress = Math.max(8, Math.min(100, (Number.parseFloat(data.hzValue) || 0) / 2));
    const vocalAgeProgress = Math.max(8, Math.min(100, data.vocalAgeScore));
    const potentialRating = data.potentialRating;

    const createMinimalCardStyle = (startColor: string, endColor: string) => ({
        background: `linear-gradient(135deg, rgba(14, 16, 24, 0.98) 0%, rgba(9, 12, 18, 0.98) 44%, ${hexToRgba(startColor, 0.16)} 72%, ${hexToRgba(endColor, 0.28)} 100%)`,
        border: `1px solid ${hexToRgba(endColor, 0.3)}`,
        boxShadow: isExportRender ? 'none' : `inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 24px rgba(0, 0, 0, 0.32), 0 0 24px ${hexToRgba(endColor, 0.14)}`
    });
    const createGradientTextStyle = (startColor: string, endColor: string) => ({
        backgroundImage: `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        textShadow: `0 0 18px ${hexToRgba(endColor, 0.2)}`
    });
    const minimalAvatarRingStyle = {
        background: `linear-gradient(180deg, ${data.minimalAvatarRingColorStart} 0%, ${data.minimalAvatarRingColorEnd} 100%)`,
        boxShadow: isExportRender ? 'none' : `0 0 32px ${hexToRgba(data.minimalAvatarRingColorEnd, 0.24)}`
    };
    const frameAspectRatio = 1024 / 495;
    const basePreviewHeight = data.useIphoneFrame
        ? previewWidth * frameAspectRatio
        : previewWidth * (16 / 9);
    const isLiveMobile = renderMode === 'live' && viewportWidth <= 720;
    const liveTargetWidth = isLiveMobile
        ? Math.min(previewWidth, viewportWidth - (viewportWidth <= 480 ? 24 : 28))
        : previewWidth;
    const liveScale = liveTargetWidth / previewWidth;
    const liveShellStyle = useMemo(() => (
        isLiveMobile
            ? {
                width: `${liveTargetWidth}px`,
                height: `${basePreviewHeight * liveScale}px`
            }
            : undefined
    ), [basePreviewHeight, isLiveMobile, liveScale, liveTargetWidth]);
    const livePreviewStyle = useMemo(() => ({
        width: `${previewWidth}px`,
        ...(isLiveMobile
            ? {
                transform: `scale(${liveScale})`,
                transformOrigin: 'top center'
            }
            : {})
    }), [isLiveMobile, liveScale, previewWidth]);
    const previewContent = (
        <div
            id={exportId}
            className={`phone-preview-export ${renderMode === 'export' ? 'export-render' : 'live-render'} ${data.useIphoneFrame ? 'with-frame' : 'without-frame'}`}
            style={isExportRender ? { width: `${previewWidth}px`, height: `${basePreviewHeight}px` } : livePreviewStyle}
        >
            {data.useIphoneFrame && (
                <img
                    src={iphoneFrame}
                    alt="iPhone Frame"
                    className="iphone-frame"
                />
            )}

            <div className={`phone-screen ${data.useIphoneFrame ? 'phone-screen-framed' : 'phone-screen-plain'}`}>
                <div className={`screen-content ${mode === 'blackpill' ? 'blackpill-layout' : mode === 'testVoice' ? 'test-voice-layout' : mode === 'minimal' ? 'minimal-screen-layout' : 'standard-layout'}`} style={{ overflowY: mode === 'blackpill' || mode === 'testVoice' || mode === 'minimal' ? 'hidden' : 'auto' }}>
                    {mode === 'testVoice' ? (
                        <>
                            <div className="test-voice-header">
                                <div className="test-voice-logo">DeepTone</div>
                                <h1 className="test-voice-title">Test Your Voice</h1>
                                <p className="test-voice-subtitle">Tap the button to record</p>
                            </div>

                            <div className="test-voice-mic-container">
                                <div className="test-voice-mic-btn">
                                    <Mic2 size={32} />
                                </div>
                                <span className="test-voice-mic-label">Tap to Record</span>
                            </div>

                            <div className="test-voice-results">
                                <p style={{ fontSize: '15px', fontWeight: 700, color: '#61729A', marginBottom: '8px' }}>Your Voice</p>
                                <h2 style={{ fontSize: '56px', fontWeight: 900, color: '#3A78FF', marginBottom: '16px' }}>{data.hzValue} {data.hzValue ? 'Hz' : ''}</h2>
                                <p style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'white' }}>{data.ratingSubtitle}</p>
                            </div>
                        </>
                    ) : isMinimal ? (
                        <>
                            <div className="minimal-layout">
                                <div className="minimal-top-badge">
                                    <div className="avatar-app-badge">
                                        <img src={appIcon} alt="Deeptone app icon" className="avatar-app-badge-main-icon" width="22" height="22" />
                                        <span>DEEPTONE</span>
                                        <div className="avatar-app-badge-store-icon">
                                            {appStoreBadgeSrc ? (
                                                <img src={appStoreBadgeSrc} alt="App Store logo" className="avatar-app-badge-store-icon-image" width="24" height="24" />
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="minimal-avatar-ring" style={minimalAvatarRingStyle}>
                                    <div className="minimal-avatar-circle">
                                        {data.avatarImage ? (
                                            <img src={renderedAvatar ?? data.avatarImage} alt="Avatar" className="minimal-avatar-image" />
                                        ) : (
                                            <Book className="minimal-avatar-fallback" size={82} />
                                        )}
                                    </div>
                                </div>

                                <div className="minimal-stat-card" style={createMinimalCardStyle(data.minimalHzColorStart, data.minimalHzColorEnd)}>
                                    <div className="minimal-stat-head">
                                        <div>
                                            <span className="minimal-stat-label">Voice Hz</span>
                                            <p className="minimal-stat-subtitle">Deeptone voice reading</p>
                                        </div>
                                        <span className="minimal-stat-rating" style={createGradientTextStyle(data.minimalHzColorStart, data.minimalHzColorEnd)}>{data.looksmaxxingRating}</span>
                                    </div>
                                    <div className="minimal-stat-value-row">
                                        <span className="minimal-stat-value">{data.hzValue}</span>
                                        <span className="minimal-stat-unit" style={{ color: data.minimalHzColorEnd }}>{data.hzValue ? 'Hz' : ''}</span>
                                    </div>
                                    <div className="minimal-progress-track">
                                        <div
                                            className="minimal-progress-fill"
                                            style={{
                                                width: `${hzProgress}%`,
                                                background: `linear-gradient(90deg, ${data.minimalHzColorStart} 0%, ${data.minimalHzColorEnd} 100%)`,
                                                boxShadow: isExportRender ? 'none' : `0 0 14px ${data.minimalHzColorEnd}`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="minimal-metrics-grid">
                                    <div className="minimal-stat-card minimal-stat-card-grid minimal-stat-card-potential" style={createMinimalCardStyle(data.minimalPotentialColorStart, data.minimalPotentialColorEnd)}>
                                        <div className="minimal-stat-head">
                                            <div>
                                                <span className="minimal-stat-label">Potential</span>
                                                <p className="minimal-stat-subtitle minimal-stat-subtitle-rating" style={createGradientTextStyle(data.minimalPotentialColorStart, data.minimalPotentialColorEnd)}>{potentialRating}</p>
                                            </div>
                                            <span className="minimal-stat-rating" style={createGradientTextStyle(data.minimalPotentialColorStart, data.minimalPotentialColorEnd)}>{data.potentialScore}</span>
                                        </div>
                                        <div className="minimal-progress-track">
                                            <div
                                                className="minimal-progress-fill minimal-progress-fill-strong"
                                                style={{
                                                    width: `${Math.max(8, Math.min(100, data.potentialScore))}%`,
                                                    background: `linear-gradient(90deg, ${data.minimalPotentialColorStart} 0%, ${data.minimalPotentialColorEnd} 100%)`,
                                                    boxShadow: isExportRender ? 'none' : `0 0 14px ${data.minimalPotentialColorEnd}`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="minimal-stat-card minimal-stat-card-grid minimal-stat-card-vocal-age" style={createMinimalCardStyle(data.minimalVocalAgeColorStart, data.minimalVocalAgeColorEnd)}>
                                        <div className="minimal-stat-head">
                                            <div>
                                                <span className="minimal-stat-label">Vocal Age</span>
                                            </div>
                                            <span className="minimal-stat-rating" style={createGradientTextStyle(data.minimalVocalAgeColorStart, data.minimalVocalAgeColorEnd)}>{data.vocalAgeScore}</span>
                                        </div>
                                        <div className="minimal-progress-track">
                                            <div
                                                className="minimal-progress-fill minimal-progress-fill-cyan"
                                                style={{
                                                    width: `${vocalAgeProgress}%`,
                                                    background: `linear-gradient(90deg, ${data.minimalVocalAgeColorStart} 0%, ${data.minimalVocalAgeColorEnd} 100%)`,
                                                    boxShadow: isExportRender ? 'none' : `0 0 14px ${data.minimalVocalAgeColorEnd}`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="app-store-download" style={{ textAlign: 'center', marginTop: 'auto', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <AppleLogo size={16} />
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Download on the App Store</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                                    <img src={appIcon} alt="App Icon" width="22" height="22" style={{ width: '22px', height: '22px', borderRadius: '4px' }} />
                                    <p style={{ fontSize: '16px', fontWeight: 700 }}>Search <span style={{ color: 'var(--blue-light)' }}>Deeptone</span></p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={`profile-center ${isBlackpill ? 'profile-center-blackpill' : ''}`}>
                                <div className={`avatar-ring ${isBlackpill ? 'avatar-ring-compact' : ''}`}>
                                    <div className="avatar-circle">
                                        {data.avatarImage ? (
                                            <img src={renderedAvatar ?? data.avatarImage} alt="Avatar" className="avatar-photo" />
                                        ) : (
                                            <Book className="avatar-icon" size={56} />
                                        )}
                                    </div>
                                </div>
                                <div className={`avatar-app-badge ${isBlackpill ? 'avatar-app-badge-compact' : ''}`}>
                                    <img src={appIcon} alt="Deeptone app icon" className="avatar-app-badge-main-icon" width="22" height="22" />
                                    <span>DEEPTONE</span>
                                    <div className="avatar-app-badge-store-icon">
                                        {appStoreBadgeSrc ? (
                                            <img src={appStoreBadgeSrc} alt="App Store logo" className="avatar-app-badge-store-icon-image" width="24" height="24" />
                                        ) : null}
                                    </div>
                                </div>
                                {!isBlackpill && <h2 className="user-name" style={{ marginBottom: '4px' }}>{data.title}</h2>}
                                {mode === 'standard' && <p className="user-desc">{data.subtitle}</p>}

                                <div className="badges" style={{ justifyContent: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div className="badge looksmaxxing-badge" style={{ gap: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-15px' }}>
                                        <img src={appIcon} alt="App Icon" width="40" height="40" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                        <span style={{ textTransform: 'capitalize', fontSize: '34px', fontWeight: 900 }}>{data.looksmaxxingRating}</span>
                                    </div>
                                    {mode === 'blackpill' && (
                                        <>
                                            <h2 className="user-name user-name-blackpill" style={{ marginBottom: '8px', marginTop: '10px' }}>{data.title}</h2>
                                            <p className="rating-subtitle" style={{ color: '#8E8E93', fontSize: '14px', marginTop: '0', fontWeight: 500, letterSpacing: '0.5px' }}>
                                                {data.ratingSubtitle}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {mode === 'standard' ? (
                                <>
                                    <div className="scores-row" style={{ marginBottom: 0 }}>
                                        <ScoreCircle value={data.authorityScore} label="Authority" startColor={data.authorityColorStart} endColor={data.authorityColorEnd} />
                                        <ScoreCircle value={data.vocalAgeScore} label="Vocal Age" startColor={data.vocalAgeColorStart} endColor={data.vocalAgeColorEnd} />
                                        <ScoreCircle value={data.potentialScore} label="Potential" startColor={data.potentialColorStart} endColor={data.potentialColorEnd} />
                                    </div>

                                    <div className="voice-signature-card" style={{ marginBottom: 0 }}>
                                        <h3 className="card-title">VOICE SIGNATURE</h3>
                                        <div className="signature-list">
                                            <div className="signature-item">
                                                <div className="item-label">
                                                    <Activity className="item-icon blue-light" size={18} />
                                                    <span>Baseline Frequency</span>
                                                </div>
                                                <span className="item-value">{data.baselineFrequency} Hz</span>
                                            </div>
                                            <div className="signature-item">
                                                <div className="item-label">
                                                    <Mic2 className="item-icon blue-light" size={18} />
                                                    <span>Voice Classification</span>
                                                </div>
                                                <span className="item-value">{data.voiceClassification}</span>
                                            </div>
                                            <div className="signature-item">
                                                <div className="item-label">
                                                    <ArrowDownToLine className="item-icon blue-light" size={18} />
                                                    <span>Depth Rating</span>
                                                </div>
                                                <span className="item-value">{data.depthRating}</span>
                                            </div>
                                            <div className="signature-item">
                                                <div className="item-label">
                                                    <Zap className="item-icon blue-light" size={18} />
                                                    <span>Training Status</span>
                                                </div>
                                                <span className="item-value">{data.trainingStatus}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="blackpill-dashboard" style={{ width: '100%', padding: '0 10px', marginTop: '0' }}>
                                    <div className="hz-display-container" style={{ textAlign: 'center', marginBottom: '24px' }}>
                                        <div className="hz-circle" style={{
                                            width: `${hzCircleSize}px`, height: `${hzCircleSize}px`,
                                            borderRadius: '50%', border: '6px solid var(--blue-primary)',
                                            margin: '0 auto', display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 0 30px rgba(10, 132, 255, 0.4)',
                                            backgroundColor: 'rgba(0,0,0,0.5)'
                                        }}>
                                            <span style={{ fontSize: '56px', fontWeight: 900, lineHeight: 1, color: 'white' }}>{data.hzValue}</span>
                                            <span style={{ fontSize: '18px', color: 'var(--blue-light)', fontWeight: 700, marginTop: '2px' }}>Hz</span>
                                        </div>
                                    </div>

                                    <div className="blackpill-stats" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div className="stat-card" style={{ backgroundColor: '#1C1C1E', padding: '16px', borderRadius: '16px', border: '1px solid #333' }}>
                                            <span style={{ color: '#8E8E93', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Vocal Masculinity</span>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                                                <div style={{ flex: 1, height: '12px', backgroundColor: '#000', borderRadius: '8px', marginRight: '16px', overflow: 'hidden', border: '1px solid #333' }}>
                                                    <div style={{ width: `${data.masculinityScore}%`, height: '100%', backgroundColor: 'var(--blue-light)', borderRadius: '8px', boxShadow: '0 0 10px var(--blue-light)' }} />
                                                </div>
                                                <span style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>{data.masculinityScore}%</span>
                                            </div>
                                        </div>

                                        <div className="blackpill-stat-grid">
                                            <div className="stat-card" style={{ flex: 1, backgroundColor: '#1C1C1E', padding: '16px', borderRadius: '16px', textAlign: 'center', border: '1px solid #333' }}>
                                                <span style={{ color: '#8E8E93', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Percentile</span>
                                                <span style={{ fontSize: '20px', fontWeight: 900, color: 'white' }}>{data.percentile}</span>
                                            </div>

                                            <div className="stat-card" style={{ flex: 1, backgroundColor: '#1C1C1E', padding: '16px', borderRadius: '16px', textAlign: 'center', border: '1px solid #333' }}>
                                                <span style={{ color: '#8E8E93', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Cortisol Level</span>
                                                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--blue-light)' }}>{data.cortisolLevel}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="app-store-download" style={{ textAlign: 'center', marginTop: isBlackpill ? '8px' : '0', marginBottom: isBlackpill ? '0' : '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <AppleLogo size={16} />
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Download on the App Store</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                                    <img src={appIcon} alt="App Icon" width="22" height="22" style={{ width: '22px', height: '22px', borderRadius: '4px' }} />
                                    <p style={{ fontSize: '16px', fontWeight: 700 }}>Search <span style={{ color: 'var(--blue-light)' }}>Deeptone</span></p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    if (isLiveMobile) {
        return (
            <div className="phone-preview-live-shell" style={liveShellStyle}>
                {previewContent}
            </div>
        );
    }

    return previewContent;
}

function ScoreCircle({ value, label, startColor, endColor }: { value: number; label: string; startColor: string; endColor: string }) {
    const gradientId = useId().replace(/:/g, '');
    const glowId = `${gradientId}-glow`;
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="score-item">
            <div className="circular-progress">
                <svg width="104" height="104" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={startColor} />
                            <stop offset="100%" stopColor={endColor} />
                        </linearGradient>
                        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <circle
                        className="circle-bg"
                        cx="50" cy="50" r={radius}
                        fill="none" strokeWidth="5"
                    />
                    <circle
                        className="circle-progress"
                        cx="50" cy="50" r={radius}
                        fill="none" strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 50 50)"
                        strokeLinecap="round"
                        stroke={`url(#${gradientId})`}
                        filter={`url(#${glowId})`}
                    />
                </svg>
                <div className="score-value">{value}</div>
            </div>
            <div className="score-label" style={{ fontSize: '14px', marginTop: '4px' }}>{label}</div>
        </div>
    );
}
