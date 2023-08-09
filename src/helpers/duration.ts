const divmod = (x: number, y: number) : [number, number] => [ Math.floor(x / y), x % y ];

export default function formatSeconds(seconds: number): string {
    const totalSeconds: number = Math.round(seconds / 1000);
    let [totalMinutes, _seconds] = divmod(totalSeconds, 60);
    let [hours, minutes] = divmod(totalMinutes, 60);
    let s: string = _seconds > 9 ? `${_seconds}` : `0${_seconds}`;
    let m: string = minutes > 9 ? `${minutes}` : `0${minutes}`;
    let duration: string = `${m}:${s}`;
    if (hours) duration = (hours > 9 ? `${hours}:` : `0${hours}:`) + duration;
    return duration
}
