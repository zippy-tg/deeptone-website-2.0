import { useEffect, useId, useState } from 'react';
import { Book, Activity, Mic2, ArrowDownToLine, Zap } from 'lucide-react';
import type { DashboardMode, ProfileData } from '../types';
import { renderCroppedAvatar } from '../utils/avatarCrop';
import { extractTransparentLogo, imageToDataUri } from '../utils/appStoreLogo';
import { hexToRgba } from '../utils/color';
import appIcon from '../assets/app-icon.png';
import appStoreLogoBase from '../assets/app-store-logo.webp';

interface SquareExportPreviewProps {
    data: ProfileData;
    mode: DashboardMode;
}

const AppleLogo = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
);

export function SquareExportPreview({ data, mode }: SquareExportPreviewProps) {
    const [renderedAvatar, setRenderedAvatar] = useState<string | null>(data.avatarImage);
    const [appStoreBadgeSrc, setAppStoreBadgeSrc] = useState<string | null>(null);
    const [appIconBase64, setAppIconBase64] = useState<string | null>(null);

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

        // Also inline the app icon for Safari export reliability
        imageToDataUri(appIcon)
            .then(uri => { if (!cancelled) setAppIconBase64(uri); })
            .catch(() => { if (!cancelled) setAppIconBase64(appIcon); });

        return () => {
            cancelled = true;
        };
    }, []);

    const allAssetsLoaded = !data.avatarImage || (renderedAvatar && appIconBase64);

    if (!allAssetsLoaded) {
        return null;
    }
    const avatarSrc = data.avatarImage ? (renderedAvatar ?? data.avatarImage) : null;
    const hzProgress = Math.max(8, Math.min(100, (Number.parseFloat(data.hzValue) || 0) / 2));
    const vocalAgeProgress = Math.max(8, Math.min(100, data.vocalAgeScore));
    const potentialRating = data.potentialRating;
    const createMinimalCardStyle = (_startColor: string, endColor: string) => ({
        background: 'linear-gradient(135deg, #101319 0%, #0d121b 100%)',
        border: `1px solid ${hexToRgba(endColor, 0.34)}`,
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)'
    });
    const createGradientTextStyle = (_startColor: string, endColor: string) => ({
        color: endColor,
        textShadow: 'none',
        backgroundImage: 'none'
    });
    const minimalAvatarRingStyle = {
        background: `linear-gradient(180deg, ${data.minimalAvatarRingColorStart} 0%, ${data.minimalAvatarRingColorEnd} 100%)`,
        boxShadow: 'none'
    };

    return (
        <div id="square-preview-export" className="square-ui-export" aria-hidden="true">
            {mode === 'testVoice' ? (
                <div className="square-ui-shell square-ui-shell-testvoice">
                    <div className="square-ui-testvoice-header">
                        <div className="square-ui-logo">DeepTone</div>
                        <h1 className="square-ui-testvoice-title">Test Your Voice</h1>
                        <p className="square-ui-testvoice-subtitle">Tap the button to record</p>
                    </div>

                    <div className="square-ui-testvoice-center">
                        <div className="square-ui-testvoice-mic-btn">
                            <Mic2 size={56} />
                        </div>
                        <span className="square-ui-testvoice-mic-label">Tap to Record</span>
                    </div>

                    <div className="square-ui-testvoice-card">
                        <p className="square-ui-eyebrow">Your Voice</p>
                        <h2 className="square-ui-testvoice-value">{data.hzValue}{data.hzValue ? ' Hz' : ''}</h2>
                        <p className="square-ui-testvoice-rating">{data.ratingSubtitle}</p>
                    </div>
                </div>
            ) : mode === 'minimal' ? (
                <div className="square-ui-shell square-ui-shell-minimal">
                    <div className="square-ui-minimal-badge">
                        <div className="avatar-app-badge">
                            <img src={appIcon} alt="Deeptone app icon" className="avatar-app-badge-main-icon" />
                            <span>DEEPTONE</span>
                            <div className="avatar-app-badge-store-icon">
                                {appStoreBadgeSrc ? (
                                    <img src={appStoreBadgeSrc} alt="App Store logo" className="avatar-app-badge-store-icon-image" />
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="square-ui-minimal-avatar-ring" style={minimalAvatarRingStyle}>
                        <div className="square-ui-minimal-avatar-circle">
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="Avatar" className="square-ui-minimal-avatar-image" />
                            ) : (
                                <Book className="square-ui-avatar-fallback" size={136} />
                            )}
                        </div>
                    </div>

                    <div className="square-ui-minimal-card" style={createMinimalCardStyle(data.minimalHzColorStart, data.minimalHzColorEnd)}>
                        <div className="square-ui-minimal-card-head">
                            <div>
                                <span className="square-ui-minimal-card-label">Voice Hz</span>
                                <p className="square-ui-minimal-card-subtitle">Deeptone voice reading</p>
                            </div>
                            <span className="square-ui-minimal-card-rating" style={createGradientTextStyle(data.minimalHzColorStart, data.minimalHzColorEnd)}>{data.looksmaxxingRating}</span>
                        </div>
                        <div className="square-ui-minimal-card-value-row">
                            <span className="square-ui-minimal-hz-value">{data.hzValue}</span>
                            <span className="square-ui-minimal-hz-label" style={{ color: data.minimalHzColorEnd }}>{data.hzValue ? 'Hz' : ''}</span>
                        </div>
                        <div className="square-ui-minimal-progress-track">
                            <div
                                className="square-ui-minimal-progress-fill"
                                style={{
                                    width: `${hzProgress}%`,
                                    background: `linear-gradient(90deg, ${data.minimalHzColorStart} 0%, ${data.minimalHzColorEnd} 100%)`,
                                    boxShadow: `0 0 14px ${data.minimalHzColorEnd}`
                                }}
                            />
                        </div>
                    </div>

                    <div className="square-ui-minimal-grid">
                        <div className="square-ui-minimal-card square-ui-minimal-card-grid square-ui-minimal-card-accent" style={createMinimalCardStyle(data.minimalPotentialColorStart, data.minimalPotentialColorEnd)}>
                            <div className="square-ui-minimal-card-head">
                                <div>
                                    <span className="square-ui-minimal-card-label">Potential</span>
                                    <p className="square-ui-minimal-card-subtitle square-ui-minimal-card-subtitle-rating" style={createGradientTextStyle(data.minimalPotentialColorStart, data.minimalPotentialColorEnd)}>{potentialRating}</p>
                                </div>
                                <span className="square-ui-minimal-card-rating" style={createGradientTextStyle(data.minimalPotentialColorStart, data.minimalPotentialColorEnd)}>{data.potentialScore}</span>
                            </div>
                            <div className="square-ui-minimal-progress-track">
                                <div
                                    className="square-ui-minimal-progress-fill square-ui-minimal-progress-fill-strong"
                                    style={{
                                        width: `${Math.max(8, Math.min(100, data.potentialScore))}%`,
                                        background: `linear-gradient(90deg, ${data.minimalPotentialColorStart} 0%, ${data.minimalPotentialColorEnd} 100%)`,
                                        boxShadow: `0 0 14px ${data.minimalPotentialColorEnd}`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="square-ui-minimal-card square-ui-minimal-card-grid square-ui-minimal-card-vocal-age" style={createMinimalCardStyle(data.minimalVocalAgeColorStart, data.minimalVocalAgeColorEnd)}>
                            <div className="square-ui-minimal-card-head">
                                <div>
                                    <span className="square-ui-minimal-card-label">Vocal Age</span>
                                </div>
                                <span className="square-ui-minimal-card-rating" style={createGradientTextStyle(data.minimalVocalAgeColorStart, data.minimalVocalAgeColorEnd)}>{data.vocalAgeScore}</span>
                            </div>
                            <div className="square-ui-minimal-progress-track">
                                <div
                                    className="square-ui-minimal-progress-fill square-ui-minimal-progress-fill-cyan"
                                    style={{
                                        width: `${vocalAgeProgress}%`,
                                        background: `linear-gradient(90deg, ${data.minimalVocalAgeColorStart} 0%, ${data.minimalVocalAgeColorEnd} 100%)`,
                                        boxShadow: `0 0 14px ${data.minimalVocalAgeColorEnd}`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="square-ui-download">
                        <div className="square-ui-download-row">
                            <AppleLogo size={16} />
                            <p>Download on the App Store</p>
                        </div>
                        <div className="square-ui-download-row square-ui-download-row-strong">
                            <img src={appIconBase64 || appIcon} alt="App Icon" />
                            <p>Search <span>Deeptone</span></p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`square-ui-shell ${mode === 'blackpill' ? 'square-ui-shell-blackpill' : 'square-ui-shell-standard'}`}>
                    <div className={`square-ui-profile ${mode === 'blackpill' ? 'square-ui-profile-blackpill' : ''}`}>
                        <div className={`square-ui-avatar-ring ${mode === 'blackpill' ? 'square-ui-avatar-ring-compact' : ''}`}>
                            <div className="square-ui-avatar-circle">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="Avatar" className="square-ui-avatar-image" />
                                ) : (
                                    <Book className="square-ui-avatar-fallback" size={88} />
                                )}
                            </div>
                        </div>

                        <div className={`avatar-app-badge ${mode === 'blackpill' ? 'avatar-app-badge-compact' : ''}`}>
                            <img src={appIconBase64 || appIcon} alt="Deeptone app icon" className="avatar-app-badge-main-icon" />
                            <span>DEEPTONE</span>
                            <div className="avatar-app-badge-store-icon">
                                {appStoreBadgeSrc ? (
                                    <img src={appStoreBadgeSrc} alt="App Store logo" className="avatar-app-badge-store-icon-image" />
                                ) : null}
                            </div>
                        </div>

                        {mode === 'standard' && (
                            <>
                                <h2 className="square-ui-title">{data.title}</h2>
                                <p className="square-ui-subtitle">{data.subtitle}</p>
                            </>
                        )}

                        <div className="square-ui-rating-block">
                            <div className="square-ui-rating-line">
                                <img src={appIconBase64 || appIcon} alt="App Icon" className="square-ui-rating-icon" />
                                <span className="square-ui-rating-value">{data.looksmaxxingRating}</span>
                            </div>

                            {mode === 'blackpill' && (
                                <>
                                    <h2 className="square-ui-title square-ui-title-blackpill">{data.title}</h2>
                                    <p className="square-ui-subtitle square-ui-subtitle-blackpill">{data.ratingSubtitle}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {mode === 'standard' ? (
                        <>
                            <div className="square-ui-scores">
                                <SquareScoreCircle value={data.authorityScore} label="Authority" startColor={data.authorityColorStart} endColor={data.authorityColorEnd} />
                                <SquareScoreCircle value={data.vocalAgeScore} label="Vocal Age" startColor={data.vocalAgeColorStart} endColor={data.vocalAgeColorEnd} />
                                <SquareScoreCircle value={data.potentialScore} label="Potential" startColor={data.potentialColorStart} endColor={data.potentialColorEnd} />
                            </div>

                            <div className="square-ui-voice-card">
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
                        <div className="square-ui-blackpill-dashboard">
                            <div className="square-ui-hz-circle">
                                <span className="square-ui-hz-value">{data.hzValue}</span>
                                <span className="square-ui-hz-label">Hz</span>
                            </div>

                            <div className="square-ui-blackpill-stats">
                                <div className="square-ui-stat-card square-ui-stat-card-wide">
                                    <span className="square-ui-stat-label">Vocal Masculinity</span>
                                    <div className="square-ui-stat-progress-row">
                                        <div className="square-ui-stat-progress-track">
                                            <div className="square-ui-stat-progress-fill" style={{ width: `${data.masculinityScore}%` }} />
                                        </div>
                                        <strong className="square-ui-stat-value">{data.masculinityScore}%</strong>
                                    </div>
                                </div>

                                <div className="square-ui-blackpill-grid">
                                    <div className="square-ui-stat-card">
                                        <span className="square-ui-stat-label">Percentile</span>
                                        <strong className="square-ui-stat-value-large">{data.percentile}</strong>
                                    </div>
                                    <div className="square-ui-stat-card">
                                        <span className="square-ui-stat-label">Cortisol Level</span>
                                        <strong className="square-ui-stat-value-large square-ui-stat-accent">{data.cortisolLevel}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="square-ui-download">
                        <div className="square-ui-download-row">
                            <AppleLogo size={16} />
                            <p>Download on the App Store</p>
                        </div>
                        <div className="square-ui-download-row square-ui-download-row-strong">
                            <img src={appIconBase64 || appIcon} alt="App Icon" />
                            <p>Search <span>Deeptone</span></p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SquareScoreCircle({ value, label, startColor, endColor }: { value: number; label: string; startColor: string; endColor: string }) {
    const gradientId = useId().replace(/:/g, '');
    const glowId = `${gradientId}-glow`;
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="square-ui-score-item">
            <div className="square-ui-circular-progress">
                <svg width="128" height="128" viewBox="0 0 120 120">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={startColor} />
                            <stop offset="100%" stopColor={endColor} />
                        </linearGradient>
                        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <circle
                        className="circle-bg"
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        strokeWidth="6"
                    />
                    <circle
                        className="circle-progress"
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 60 60)"
                        strokeLinecap="round"
                        stroke={`url(#${gradientId})`}
                        filter={`url(#${glowId})`}
                    />
                </svg>
                <div className="square-ui-score-value">{value}</div>
            </div>
            <div className="square-ui-score-label">{label}</div>
        </div>
    );
}
