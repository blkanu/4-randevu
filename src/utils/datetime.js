export const startDT = (m) => new Date(`${m.date}T${m.startTime}`);
export const endDT = (m) => new Date(`${m.date}T${m.endTime}`);


export const isOngoing = (m, now = new Date()) => now >= startDT(m) && now < endDT(m);
export const hasStarted = (m, now = new Date()) => now >= startDT(m);


export const countdownText = (m, now = new Date()) => {
const start = startDT(m);
if (now >= start) return "";
const mins = Math.round((start - now) / 60000);
if (mins <= 0) return "";
if (mins < 60) return `${mins} dk kaldı`;
const h = Math.floor(mins / 60), r = mins % 60;
return r ? `${h} sa ${r} dk kaldı` : `${h} saat kaldı`;
};