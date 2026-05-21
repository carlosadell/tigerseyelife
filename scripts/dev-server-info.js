#!/usr/bin/env node
const os = require('node:os');
const qrcode = require('qrcode-terminal');

const PORT = Number(process.env.EXPO_PORT || process.argv[2] || 8082);

function pickLanIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, infos] of Object.entries(interfaces)) {
    if (!infos) continue;
    for (const info of infos) {
      if (info.family !== 'IPv4' || info.internal) continue;
      candidates.push({ address: info.address, name });
    }
  }

  if (candidates.length === 0) return null;

  const score = (entry) => {
    const a = entry.address;
    if (a.startsWith('192.168.')) return 5;
    if (a.startsWith('172.20.10.')) return 4;
    if (a.startsWith('10.')) return 3;
    if (a.startsWith('172.')) return 2;
    return 1;
  };

  candidates.sort((a, b) => score(b) - score(a));
  return candidates[0];
}

function describeInterface(name) {
  if (name === 'en0') return 'Wi-Fi or Ethernet';
  if (name === 'en1' || name === 'en2') return 'Secondary Wi-Fi / Thunderbolt';
  if (name.startsWith('bridge')) return 'Personal Hotspot (Mac sharing)';
  if (name.startsWith('utun') || name.startsWith('ipsec')) return 'VPN tunnel';
  return name;
}

const picked = pickLanIp();
if (!picked) {
  console.log('\n  ⚠  No LAN IP detected. Phone will not be able to reach the dev server.\n');
  process.exit(0);
}

const url = `exp://${picked.address}:${PORT}`;
const bar = '─'.repeat(46);

console.log(`\n  ${bar}`);
console.log(`  TIGERS EYE LIFE  ·  dev-client connection`);
console.log(`  ${bar}\n`);
console.log(`  Interface : ${picked.name}  (${describeInterface(picked.name)})`);
console.log(`  URL       : ${url}\n`);

qrcode.generate(url, { small: true }, (qr) => {
  console.log(
    qr
      .split('\n')
      .map((line) => '  ' + line)
      .join('\n'),
  );
});

console.log(`  Open the Tigers Eye Life dev-client app on your phone,`);
console.log(`  or scan the QR with your camera, or paste the URL above.\n`);
console.log(`  Make sure your phone is on the same network as this Mac.\n`);
