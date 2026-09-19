// Finalize static entry points and enforce the publication file allowlist.
import fs from 'node:fs';
import path from 'node:path';
const buildDir = path.resolve('landing/dist');
fs.copyFileSync(path.resolve('landing/vercel.json'), path.join(buildDir, 'vercel.json'));
fs.copyFileSync(path.join(buildDir, 'index.html'), path.join(buildDir, 'demo.html'));
fs.copyFileSync(path.join(buildDir, 'index.html'), path.join(buildDir, 'platform-demo.html'));
// Provenance stays with the source asset; only website runtime files are published.
const sidecar = path.join(buildDir, 'images/broker-desk.webp.json');
if (fs.existsSync(sidecar)) fs.unlinkSync(sidecar);
const allowed =
  /^((index|demo|platform-demo)\.html|favicon\.svg|vercel\.json|assets\/[\w.-]+\.(js|css|woff2)|assets\/(site-qr|github-qr)-[\w-]+\.png|assets\/pdf.worker.min-[\w-]+\.mjs|demo\/demo-[123]\.pdf|images\/broker-desk\.webp)$/;
const files = fs
  .readdirSync(buildDir, { recursive: true })
  .filter((p) => fs.statSync(path.join(buildDir, p as string)).isFile())
  .map((p) => (p as string).replaceAll('\\', '/'));
for (const file of files)
  if (!allowed.test(file)) throw new Error(`Unexpected publication file: ${file}`);
console.log(
  `Publication boundary verified: ${files.length} static files, including only three synthetic PDFs.`,
);
