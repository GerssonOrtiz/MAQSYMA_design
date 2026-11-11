import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const videos = [
  { video: 'video-01-awakening.mp4', poster: 'poster-01.webp', timestamp: '00:00:02.500' },
  { video: 'video-02-esab-power.mp4', poster: 'poster-02.webp', timestamp: '00:00:02.000' },
  { video: 'video-03-welding-action.mp4', poster: 'poster-03.webp', timestamp: '00:00:02.000' },
  { video: 'video-04-industrial-solutions.mp4', poster: 'poster-04.webp', timestamp: '00:00:02.500' },
  { video: 'video-05-built-for-industry.mp4', poster: 'poster-05.webp', timestamp: '00:00:02.000' }
];

const cinematicDir = path.resolve('assets/cinematic');
const tempDir = path.resolve('temp_posters');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log('--- Generating WebP Posters from Videos ---');

for (const item of videos) {
  const videoPath = path.join(cinematicDir, item.video);
  const posterPath = path.join(cinematicDir, item.poster);
  const tempPng = path.join(tempDir, `${path.parse(item.video).name}.png`);

  if (!fs.existsSync(videoPath)) {
    console.warn(`[SKIP] Video not found: ${videoPath}`);
    continue;
  }

  console.log(`Extracting frame from ${item.video} at ${item.timestamp}...`);
  // FFmpeg extraction of a representative clean frame
  const ffmpegCmd = `ffmpeg -y -ss ${item.timestamp} -i "${videoPath}" -vframes 1 -q:v 2 "${tempPng}"`;
  execSync(ffmpegCmd, { stdio: 'pipe' });

  console.log(`Optimizing with sharp to WebP: ${item.poster}...`);
  await sharp(tempPng)
    .resize({ width: 1920, height: 1080, fit: 'cover' })
    .webp({ quality: 84, effort: 6 })
    .toFile(posterPath);

  const stats = fs.statSync(posterPath);
  console.log(`✓ Generated ${item.poster} (${(stats.size / 1024).toFixed(1)} KB)`);

  if (fs.existsSync(tempPng)) {
    fs.unlinkSync(tempPng);
  }
}

if (fs.existsSync(tempDir)) {
  fs.rmdirSync(tempDir);
}

console.log('--- All posters generated successfully! ---');
