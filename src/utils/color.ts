export function hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace('#', '');
    const expanded = normalized.length === 3
        ? normalized.split('').map((char) => `${char}${char}`).join('')
        : normalized;

    const value = Number.parseInt(expanded, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
