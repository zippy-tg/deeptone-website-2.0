export function getRatingToneClass(rating: string): string {
    const normalized = rating.trim().toLowerCase();

    switch (normalized) {
        case 'sub5':
            return 'rating-tone-sub5';
        case 'ltn':
            return 'rating-tone-ltn';
        case 'mtn':
            return 'rating-tone-mtn';
        case 'htn':
            return 'rating-tone-htn';
        case 'chadlite':
            return 'rating-tone-chadlite';
        case 'chad':
            return 'rating-tone-chad';
        case 'adam':
            return 'rating-tone-adam';
        default:
            return 'rating-tone-default';
    }
}
