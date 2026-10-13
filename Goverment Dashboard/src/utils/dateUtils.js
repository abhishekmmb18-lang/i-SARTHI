// Standardized Date and Time formatting utility for iSARTHI Telemetry & Alerts

export function formatDateTime(isoString) {
    if (!isoString) return 'Live Just now';
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return String(isoString);

        const datePart = d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const timePart = d.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        return `${datePart} • ${timePart}`;
    } catch {
        return String(isoString);
    }
}

export function formatDateOnly(isoString) {
    if (!isoString) return 'Today';
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return String(isoString);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return String(isoString);
    }
}

export function formatTimeOnly(isoString) {
    if (!isoString) return 'Just now';
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return String(isoString);
        return d.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    } catch {
        return String(isoString);
    }
}
