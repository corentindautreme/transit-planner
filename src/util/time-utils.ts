const NETWORK_TZ = process.env.NETWORK_TZ;
const SCHEDULES_OFFSET = process.env.SCHEDULES_OFFSET;

function getTimezoneOffset(timezone: string) {
    const str = new Date().toLocaleString('en', {timeZone: timezone, timeZoneName: 'longOffset'});
    const [_, h, m] = str.match(/([+-]\d+):(\d+)$/) || [0, '+00', '00'];
    // @ts-ignore
    return  h * 60 + (h > 0 ? +m : -m);
}

export function getNetworkOffset() {
    if (!NETWORK_TZ || !SCHEDULES_OFFSET) {
        throw new Error('NETWORK_TZ or SCHEDULES_OFFSET is not defined. Please set these environment variables.');
    }
    return getTimezoneOffset(NETWORK_TZ) - getTimezoneOffset(SCHEDULES_OFFSET);
}

export function applyOffset(dates: Date[]): Date[] {
    const offset = getNetworkOffset();
    if (offset == 0) {
        return dates;
    }
    return dates.map(d => new Date(d.getTime() - (offset * 60000)));
}