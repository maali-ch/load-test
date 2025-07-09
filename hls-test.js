import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 200,              // 200 viewers
  duration: '10m',       // each runs for 10 minutes
};

const m3u8_url = 'https://live1.pulsetv.watch/hls/stream.m3u8';

export default function () {
  for (let i = 0; i < 30; i++) { // 30x loop ~ 10 min, 20s each
    const res = http.get(m3u8_url);
    check(res, { 'playlist loaded': (r) => r.status === 200 });

    const lines = res.body.split('\n');
    const tsFiles = lines.filter(line => line.endsWith('.ts'));

    for (let j = 0; j < tsFiles.length; j++) {
      const tsUrl = m3u8_url.replace('stream.m3u8', tsFiles[j]);
      const tsRes = http.get(tsUrl);
      check(tsRes, { [`${tsFiles[j]} loaded`]: (r) => r.status === 200 });
      sleep(1); // wait 1 second per segment
    }

    sleep(1); // wait 1s between playlist refreshes
  }
}
