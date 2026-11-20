// Exports the site's icons from the Icon Composer source in design/app-icon.icon.
// Run on a Mac with Xcode, pngquant, and oxipng installed: node design/export-icons.ts
//
// - Tile: Apple's own render of the icon (rounded square, transparent corners), for favicons and
//   the manifest's `any` icons, which platforms show as they are.
// - Full bleed: the same layers on an edge-to-edge square, for icons the platform masks itself:
//   apple-touch-icon (iOS rounds it) and the maskable icon (Android crops it to its own shape).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const iconPath = path.join(root, 'design/app-icon.icon');
const out = (name: string) => path.join(root, 'static', name);
const SIZE = 1024;

// 1. Tile, rendered by Icon Composer's ictool in the current (iOS 27) design generation.
const developerDir = execFileSync('xcode-select', ['-p'], { encoding: 'utf8' }).trim();
const ictool = path.join(
	developerDir,
	'../Applications/Icon Composer.app/Contents/Executables/ictool'
);
const tilePath = path.join(mkdtempSync(path.join(tmpdir(), 'icon-')), 'tile.png');
execFileSync(ictool, [
	iconPath,
	'--export-image',
	'--output-file',
	tilePath,
	'--platform',
	'iOS',
	'--rendition',
	'Default',
	'--width',
	`${SIZE}`,
	'--height',
	`${SIZE}`,
	'--scale',
	'1',
	'--design-generation',
	'27'
]);
const tile = readFileSync(tilePath);

// 2. Full bleed: the document's background gradient with the logo layer on top.
const icon = JSON.parse(readFileSync(path.join(iconPath, 'icon.json'), 'utf8'));
const [top, bottom] = icon['fill-specializations'][0].value['linear-gradient'].map(
	(color: string) => {
		const [r, g, b] = color
			.split(':')[1]
			.split(',')
			.map((v) => Math.round(Number(v) * 255));
		return `rgb(${r} ${g} ${b})`;
	}
);
const background = Buffer.from(
	`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
		<linearGradient id="g" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
		<rect width="100%" height="100%" fill="url(#g)"/></svg>`
);
const logo = readFileSync(path.join(iconPath, 'Assets/logo-large.png'));

async function fullBleed(logoScale = 1) {
	const side = Math.round(SIZE * logoScale);
	const art = await sharp(logo).resize(side, side).toBuffer();
	return sharp(background)
		.composite([{ input: art, gravity: 'center' }])
		.png()
		.toBuffer();
}

// The maskable safe zone is a centered circle 80% of the icon wide; fit the logo's farthest pixel inside it.
const { data, info } = await sharp(logo)
	.ensureAlpha()
	.extractChannel('alpha')
	.raw()
	.toBuffer({ resolveWithObject: true });
let radius = 0;
for (let y = 0; y < info.height; y++)
	for (let x = 0; x < info.width; x++)
		if (data[y * info.width + x] > 40)
			radius = Math.max(radius, Math.hypot(x - info.width / 2, y - info.height / 2));
const maskableScale = (0.4 * info.width * 0.97) / radius;

const resize = (input: Buffer, size: number) =>
	sharp(input).resize(size, size, { kernel: 'lanczos3' }).png().toBuffer();
const files: [string, Buffer][] = [
	['apple-touch-icon.png', await resize(await fullBleed(), 180)],
	['maskable-512x512.png', await resize(await fullBleed(maskableScale), 512)],
	['android-chrome-192x192.png', await resize(tile, 192)],
	['android-chrome-512x512.png', await resize(tile, 512)],
	['favicon-16x16.png', await resize(tile, 16)],
	['favicon-32x32.png', await resize(tile, 32)]
];
for (const [name, buffer] of files) {
	writeFileSync(out(name), buffer);
	execFileSync('pngquant', [
		'--force',
		'--skip-if-larger',
		'--quality',
		'85-98',
		'--output',
		out(name),
		out(name)
	]);
	execFileSync('oxipng', ['-q', '-o', '4', '--strip', 'safe', out(name)]);
}

// favicon.ico with PNG-encoded 16, 32, and 48px frames.
const frames = await Promise.all([16, 32, 48].map((size) => resize(tile, size)));
const header = Buffer.alloc(6 + 16 * frames.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach((frame, i) => {
	const size = [16, 32, 48][i];
	const entry = 6 + 16 * i;
	header.writeUInt8(size, entry);
	header.writeUInt8(size, entry + 1);
	header.writeUInt16LE(1, entry + 4);
	header.writeUInt16LE(32, entry + 6);
	header.writeUInt32LE(frame.length, entry + 8);
	header.writeUInt32LE(offset, entry + 12);
	offset += frame.length;
});
writeFileSync(out('favicon.ico'), Buffer.concat([header, ...frames]));
console.log(`Wrote ${files.length + 1} icons to static/`);
