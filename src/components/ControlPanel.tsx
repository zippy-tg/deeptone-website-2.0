import type { ProfileData, DashboardMode } from '../types';
import { toBlob } from 'html-to-image';
import { saveAs } from 'file-saver';

interface ControlPanelProps {
    data: ProfileData;
    onChange: (data: ProfileData) => void;
    mode: DashboardMode;
    onModeChange: (mode: DashboardMode) => void;
    modeLocked?: boolean;
    onBack?: () => void;
}

type ExportFormat = 'portrait' | 'square';

const EXPORT_DIMENSIONS: Record<ExportFormat, { width: number; height: number; label: string }> = {
    portrait: { width: 2160, height: 3840, label: '4k' },
    square: { width: 2160, height: 2160, label: '4k-1x1' }
};

async function waitForDocumentFonts() {
    if ('fonts' in document) {
        await document.fonts.ready;
    }
}

async function waitForExportImages(root: HTMLElement) {
    const images = Array.from(root.querySelectorAll('img'));

    await Promise.all(images.map((image) => {
        // Even if complete, we force a decode to ensure it's in GPU memory
        if (image.complete) {
            return image.decode?.().catch(() => undefined) ?? Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            const finish = async () => {
                image.removeEventListener('load', finish);
                image.removeEventListener('error', finish);
                // After load, try to decode as well
                try {
                    await image.decode?.();
                } catch {
                    // Ignore decode errors
                }
                resolve();
            };

            image.addEventListener('load', finish, { once: true });
            image.addEventListener('error', finish, { once: true });
        });
    }));

    // Critical: Add a small sleep for mobile Safari to finish painting Data URIs
    await new Promise(resolve => setTimeout(resolve, 100));
}

async function waitForExportAssets(root: HTMLElement) {
    await waitForDocumentFonts();
    await waitForExportImages(root);

    await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });
}

// Note: stabilizeBadgeClone is no longer needed since html-to-image handles SVG and fonts much better.

export function ControlPanel({ data, onChange, mode, onModeChange, modeLocked = false, onBack }: ControlPanelProps) {
    const isMinimal = mode === 'minimal';
    const updateData = (updates: Partial<ProfileData>) => {
        onChange({
            ...data,
            ...updates
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let parsedValue: string | number | boolean = value;

        if (type === 'number' || type === 'range') {
            parsedValue = Number(value);
        } else if (type === 'checkbox') {
            parsedValue = (e.target as HTMLInputElement).checked;
        }

        updateData({
            [name]: parsedValue
        } as Partial<ProfileData>);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            updateData({
                avatarImage: dataUrl,
                avatarScale: 1,
                avatarOffsetX: 0,
                avatarOffsetY: 0
            });
        };
        reader.readAsDataURL(file);
    };

    const resetAvatarCrop = () => {
        updateData({
            avatarScale: 1,
            avatarOffsetX: 0,
            avatarOffsetY: 0
        });
    };

    const handleExport = async (format: ExportFormat) => {
        const previewElement = document.getElementById(
            format === 'square' ? 'square-preview-export' : 'phone-preview-export'
        );
        if (!previewElement) return;

        const bounds = previewElement.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;

        const target = EXPORT_DIMENSIONS[format];
        await waitForExportAssets(previewElement);
        
        // Use html-to-image, which supports gradients, text-clip, mask-image, etc
        const blob = await toBlob(previewElement, {
            pixelRatio: format === 'portrait' ? target.width / bounds.width : target.width / bounds.width,
            backgroundColor: '#000000',
            width: bounds.width,
            height: bounds.height,
            style: {
                transform: 'none',
                position: 'relative',
                left: '0',
                top: '0',
                margin: '0'
            }
        });

        if (!blob) return;

        saveAs(
            blob,
            `looksmaxxing-profile-${data.looksmaxxingRating.toLowerCase()}-${target.label}.png`
        );
    };

    return (
        <div className="control-panel">
            {onBack && (
                <button type="button" className="back-btn" onClick={onBack}>
                    Back
                </button>
            )}
            <h2>Profile Editor</h2>
            <p className="subtitle">Customize the values for your TikTok mockup</p>

            {modeLocked ? (
                <div className="mode-lock-pill">
                    {mode === 'standard' ? 'Standard' : mode === 'blackpill' ? 'Blackpill' : mode === 'testVoice' ? 'Test Voice' : 'Minimal'}
                </div>
            ) : (
                <div className="mode-switch">
                    <button
                        type="button"
                        onClick={() => onModeChange('standard')}
                        className={mode === 'standard' ? 'active' : ''}
                    >
                        Standard
                    </button>
                    <button
                        type="button"
                        onClick={() => onModeChange('blackpill')}
                        className={mode === 'blackpill' ? 'active' : ''}
                    >
                        Blackpill
                    </button>
                    <button
                        type="button"
                        onClick={() => onModeChange('testVoice')}
                        className={mode === 'testVoice' ? 'active' : ''}
                    >
                        Test Voice
                    </button>
                </div>
            )}

            {!isMinimal && (
                <>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={data.title} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Subtitle</label>
                        <input type="text" name="subtitle" value={data.subtitle} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Rating Subtitle (e.g. Its over buddy)</label>
                        <input type="text" name="ratingSubtitle" value={data.ratingSubtitle} onChange={handleChange} />
                    </div>
                </>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label>Looksmaxxing Rating</label>
                    <select name="looksmaxxingRating" value={data.looksmaxxingRating} onChange={handleChange}>
                        <option value="Sub5">Sub5</option>
                        <option value="LTN">LTN</option>
                        <option value="MTN">MTN</option>
                        <option value="HTN">HTN</option>
                        <option value="Chadlite">Chadlite</option>
                        <option value="Chad">Chad</option>
                        <option value="Adam">Adam</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Avatar Image</label>
                    <input className="file-input" type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
            </div>

            {data.avatarImage && (
                <div className="avatar-crop-panel">
                    <div className="avatar-crop-header">
                        <span>Avatar crop</span>
                        <button type="button" className="secondary-btn" onClick={resetAvatarCrop}>
                            Reset
                        </button>
                    </div>

                    <div className="avatar-crop-preview">
                        <img
                            src={data.avatarImage}
                            alt="Avatar crop preview"
                            style={{
                                transform: `translate(${data.avatarOffsetX}px, ${data.avatarOffsetY}px) scale(${data.avatarScale})`
                            }}
                        />
                    </div>

                    <div className="crop-controls">
                        <label>
                            <span>Zoom</span>
                            <strong>{data.avatarScale.toFixed(2)}x</strong>
                        </label>
                        <input
                            type="range"
                            name="avatarScale"
                            min="1"
                            max="2.5"
                            step="0.01"
                            value={data.avatarScale}
                            onChange={handleChange}
                        />

                        <label>
                            <span>Horizontal</span>
                            <strong>{data.avatarOffsetX}px</strong>
                        </label>
                        <input
                            type="range"
                            name="avatarOffsetX"
                            min="-80"
                            max="80"
                            step="1"
                            value={data.avatarOffsetX}
                            onChange={handleChange}
                        />

                        <label>
                            <span>Vertical</span>
                            <strong>{data.avatarOffsetY}px</strong>
                        </label>
                        <input
                            type="range"
                            name="avatarOffsetY"
                            min="-80"
                            max="80"
                            step="1"
                            value={data.avatarOffsetY}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            )}

            <div className="form-group checkbox-group checkbox-inline">
                <input type="checkbox" id="useIphoneFrame" name="useIphoneFrame" checked={data.useIphoneFrame} onChange={handleChange} />
                <label htmlFor="useIphoneFrame">Wrap in iPhone Frame</label>
            </div>

            {isMinimal ? (
                <>
                    <div className="section-title">Minimal Template</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Hz Reading</label>
                            <input type="text" name="hzValue" value={data.hzValue} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Potential Rating</label>
                            <select name="potentialRating" value={data.potentialRating} onChange={handleChange}>
                                <option value="Sub5">Sub5</option>
                                <option value="LTN">LTN</option>
                                <option value="MTN">MTN</option>
                                <option value="HTN">HTN</option>
                                <option value="Chadlite">Chadlite</option>
                                <option value="Chad">Chad</option>
                                <option value="Adam">Adam</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Potential Score (0-100)</label>
                            <input type="number" name="potentialScore" value={data.potentialScore} onChange={handleChange} min="0" max="100" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Vocal Age (0-100)</label>
                            <input type="number" name="vocalAgeScore" value={data.vocalAgeScore} onChange={handleChange} min="0" max="100" />
                        </div>
                    </div>
                    <div className="section-title">Minimal Colors</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Voice Hz Gradient Start</label>
                            <input type="color" name="minimalHzColorStart" value={data.minimalHzColorStart} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Voice Hz Gradient End</label>
                            <input type="color" name="minimalHzColorEnd" value={data.minimalHzColorEnd} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Potential Gradient Start</label>
                            <input type="color" name="minimalPotentialColorStart" value={data.minimalPotentialColorStart} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Potential Gradient End</label>
                            <input type="color" name="minimalPotentialColorEnd" value={data.minimalPotentialColorEnd} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Vocal Age Gradient Start</label>
                            <input type="color" name="minimalVocalAgeColorStart" value={data.minimalVocalAgeColorStart} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Vocal Age Gradient End</label>
                            <input type="color" name="minimalVocalAgeColorEnd" value={data.minimalVocalAgeColorEnd} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Avatar Border Start</label>
                            <input type="color" name="minimalAvatarRingColorStart" value={data.minimalAvatarRingColorStart} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Avatar Border End</label>
                            <input type="color" name="minimalAvatarRingColorEnd" value={data.minimalAvatarRingColorEnd} onChange={handleChange} />
                        </div>
                    </div>
                </>
            ) : mode === 'standard' ? (
                <>
                    <div className="section-title">Scores</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Authority (0-100)</label>
                            <input type="number" name="authorityScore" value={data.authorityScore} onChange={handleChange} min="0" max="100" />
                        </div>
                        <div className="form-group">
                            <label>Vocal Age (0-100)</label>
                            <input type="number" name="vocalAgeScore" value={data.vocalAgeScore} onChange={handleChange} min="0" max="100" />
                        </div>
                        <div className="form-group">
                            <label>Potential (0-100)</label>
                            <input type="number" name="potentialScore" value={data.potentialScore} onChange={handleChange} min="0" max="100" />
                        </div>
                    </div>

                    <div className="section-title">Score Colors</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Authority Gradient Start</label>
                            <input type="color" name="authorityColorStart" value={data.authorityColorStart} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Authority Gradient End</label>
                            <input type="color" name="authorityColorEnd" value={data.authorityColorEnd} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Vocal Age Gradient Start</label>
                            <input type="color" name="vocalAgeColorStart" value={data.vocalAgeColorStart} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Vocal Age Gradient End</label>
                            <input type="color" name="vocalAgeColorEnd" value={data.vocalAgeColorEnd} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Potential Gradient Start</label>
                            <input type="color" name="potentialColorStart" value={data.potentialColorStart} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Potential Gradient End</label>
                            <input type="color" name="potentialColorEnd" value={data.potentialColorEnd} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="section-title">Voice Signature</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Baseline Frequency (Hz)</label>
                            <input type="number" name="baselineFrequency" value={data.baselineFrequency} onChange={handleChange} min="0" />
                        </div>
                        <div className="form-group">
                            <label>Voice Classification</label>
                            <input type="text" name="voiceClassification" value={data.voiceClassification} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Depth Rating</label>
                            <input type="text" name="depthRating" value={data.depthRating} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Training Status</label>
                            <input type="text" name="trainingStatus" value={data.trainingStatus} onChange={handleChange} />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="section-title">Blackpill Voice Metrics</div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Hz Value</label>
                            <input type="text" name="hzValue" value={data.hzValue} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Percentile</label>
                            <input type="text" name="percentile" value={data.percentile} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Masculinity (0-100)</label>
                            <input type="number" name="masculinityScore" value={data.masculinityScore} onChange={handleChange} min="0" max="100" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group control-full-width">
                            <label>Cortisol Level</label>
                            <select name="cortisolLevel" value={data.cortisolLevel} onChange={handleChange}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            {mode === 'testVoice' && (
                <>
                    <div className="section-title">Test Your Voice Results</div>
                    <div className="form-group">
                        <label>Score (Hz)</label>
                        <input type="text" name="hzValue" value={data.hzValue} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Bottom Rating Subtitle (e.g. TRUE ADAM)</label>
                        <input type="text" name="ratingSubtitle" value={data.ratingSubtitle} onChange={handleChange} />
                    </div>
                </>
            )}

            <div className="export-actions">
                <button
                    type="button"
                    className="export-btn"
                    onClick={() => handleExport('portrait')}
                >
                    Export in 4K
                </button>
                <button
                    type="button"
                    className="export-btn export-btn-secondary"
                    onClick={() => handleExport('square')}
                >
                    Export in 4K 1:1
                </button>
            </div>
        </div>
    );
}
