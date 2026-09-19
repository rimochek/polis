// Encode only allowlisted static build files for a separately authorized deployment.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve('landing/dist');
const artifact = path.resolve('artifacts/vercel-landing-files.json');
if (process.argv[2] === 'prepare') {
  const allowed =
    /^((index|demo)\.html|favicon\.svg|vercel\.json|assets\/[\w.-]+\.(js|css|woff2)|demo\/demo-[123]\.pdf|images\/broker-desk\.webp)$/;
  const files = fs
    .readdirSync(root, { recursive: true })
    .filter((p) => fs.statSync(path.join(root, p)).isFile())
    .map((p) => p.replaceAll('\\', '/'))
    .sort();
  if (files.some((f) => !allowed.test(f))) throw new Error('Unexpected file in deployment');
  const payload = files.map((file) => ({
    file,
    data: fs.readFileSync(path.join(root, file)).toString('base64'),
    encoding: 'base64',
  }));
  fs.mkdirSync(path.dirname(artifact), { recursive: true });
  fs.writeFileSync(artifact, JSON.stringify(payload));
  console.log(
    JSON.stringify({
      characters: fs.statSync(artifact).size,
      files: files.map((file) => ({ file, bytes: fs.statSync(path.join(root, file)).size })),
    }),
  );
} else {
  const start = Number(process.argv[2]),
    length = Number(process.argv[3]);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(length) || start < 0 || length > 32768)
    throw new Error('Invalid read bounds');
  const data = fs.readFileSync(artifact, 'utf8');
  process.stdout.write(data.slice(start, start + length));
}
