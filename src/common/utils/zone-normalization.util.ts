
export const normalizeZone = (zone: string): string => {
    if (!zone) return '';
    return zone.replace(/\s+/g, '').toUpperCase();
};
