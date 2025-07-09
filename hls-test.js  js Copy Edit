import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,         // virtual users
  duration: '1m',  // test duration
};

const m3u8_url = 'https://live1.pulsetv.watch/hls/stream.m3u8';

export default function () {
  const res = http.get(m3u8_url);
  check(res, { 'playlist loaded': (r) => r.status === 200 });

  const lines = res.body.split('\n');
  const tsFiles = lines.filter(line => line.endsWith('.ts'));

  for (let i = 0; i < Math.min(tsFiles.length, 3); i++) {
    const tsUrl = m3u8_url.replace('stream.m3u8', tsFiles[i]);
    const tsRes = http.get(tsUrl);
    check(tsRes, { [`${tsFiles[i]} loaded`]: (r) => r.status === 200 });
    sleep(1); // simulate viewer buffer wait
  }

  sleep(2);
}
