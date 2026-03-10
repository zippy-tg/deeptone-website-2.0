import type { ProfileData, DashboardMode } from '../types';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

interface ControlPanelProps {
    data: ProfileData;
    onChange: (data: ProfileData) => void;
    mode: DashboardMode;
    onModeChange: (mode: DashboardMode) => void;
}

export function ControlPanel({ data, onChange, mode, onModeChange }: ControlPanelProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let parsedValue: string | number | boolean = value;

        if (type === 'number') {
            parsedValue = Number(value);
        } else if (type === 'checkbox') {
            parsedValue = (e.target as HTMLInputElement).checked;
        }

        onChange({
            ...data,
            [name]: parsedValue
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onChange({ ...data, avatarImage: url });
        }
    };

    const handleExport = async () => {
        const previewElement = document.getElementById('phone-preview-export');
        if (!previewElement) return;

        // html2canvas takes a scale parameter. Scale 4 on a ~400px width element yields ~1600px width (high res).
        // Since we want 4K (2160x3840 typically), we can bump the scale depending on base width. 
        // 400 * 5 = 2000px width, 700 * 5 = 3500px height. We'll use scale: 5 for a solid 4K-ish aspect export.
        const canvas = await html2canvas(previewElement, {
            scale: 5,
            useCORS: true,
            backgroundColor: '#000000',
        });

        // Use file-saver to force cross-browser compatibility and prevent
        // Safari/WebKit from assigning a random UUID instead of the filename.
        canvas.toBlob((blob) => {
            if (!blob) return;
            saveAs(blob, `looksmaxxing-profile-${data.looksmaxxingRating.toLowerCase()}.png`);
        }, 'image/png', 1.0);
    };

    return (
        <div className="control-panel">
            <h2>Profile Editor</h2>
            <p className="subtitle">Customize the values for your TikTok mockup</p>

            <div className="mode-switch" style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#1C1C1E', padding: '4px', borderRadius: '8px' }}>
                <button
                    onClick={() => onModeChange('standard')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: mode === 'standard' ? '#2C2C2E' : 'transparent',
                        color: mode === 'standard' ? 'white' : '#8E8E93',
                        fontWeight: mode === 'standard' ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Standard
                </button>
                <button
                    onClick={() => onModeChange('blackpill')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: mode === 'blackpill' ? '#2C2C2E' : 'transparent',
                        color: mode === 'blackpill' ? 'white' : '#8E8E93',
                        fontWeight: mode === 'blackpill' ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Blackpill
                </button>
                <button
                    onClick={() => onModeChange('testVoice')}
                    style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: mode === 'testVoice' ? '#2C2C2E' : 'transparent',
                        color: mode === 'testVoice' ? 'white' : '#8E8E93',
                        fontWeight: mode === 'testVoice' ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Test Voice
                </button>
            </div>

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
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ color: 'white', padding: '10px 0' }} />
                </div>
            </div>

            <div className="form-group checkbox-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginBottom: '24px', justifyContent: 'flex-start' }}>
                <input type="checkbox" id="useIphoneFrame" name="useIphoneFrame" checked={data.useIphoneFrame} onChange={handleChange} />
                <label htmlFor="useIphoneFrame" style={{ margin: 0, fontSize: '14px' }}>Wrap in iPhone Frame</label>
            </div>

            {mode === 'standard' ? (
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
                        <div className="form-group" style={{ width: '100%' }}>
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

            <button
                className="export-btn"
                onClick={handleExport}
                style={{
                    width: '100%',
                    padding: '16px',
                    marginTop: '24px',
                    backgroundColor: 'var(--blue-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Export in 4K
            </button>
        </div>
    );
}
