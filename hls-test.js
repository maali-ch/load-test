import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 200,              // 200 viewers
  duration: '10m',       // test runs for 10 minutes
};

const m3u8_url = 'https://live1.pulsetv.watch/hls/stream.m3u8';

export default function () {
  for (let i = 0; i < 30; i++) { // ~10 min if each loop takes ~20s
    const res = http.get(m3u8_url);
    check(res, { 'playlist loaded': (r) => r.status === 200 });

    const lines = res.body.split('\n');
    const tsFiles = lines.filter(line => line.endsWith('.ts'));

    // Only check up to 10 segments (matches 2s fragment × 10 = 20s playlist)
    for (let j = 0; j < Math.min(tsFiles.length, 10); j++) {
      const tsUrl = m3u8_url.replace('stream.m3u8', tsFiles[j]);
      const tsRes = http.get(tsUrl);
      check(tsRes, { [`${tsFiles[j]} loaded`]: (r) => r.status === 200 });
      sleep(0.5); // small delay to mimic normal segment buffering
    }

    sleep(1); // pause before re-fetching the playlist
  }
}
