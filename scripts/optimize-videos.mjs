import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const videos = [
  'video-01-awakening.mp4',
  'video-02-esab-power.mp4',
  'video-03-welding-action.mp4',
  'video-04-industrial-solutions.mp4',
  'video-05-built-for-industry.mp4'
];

const cinematicDir = path.resolve('assets/cinematic');

console.log('--- Optimizing Videos for Smooth Scrollytelling Scrub ---');

for (const name of videos) {
  const input = path.join(cinematicDir, name);
  const tempOutput = path.join(cinematicDir, `temp-${name}`);

  console.log(`Processing ${name}...`);
  // H.264, no audio (-an), constant 24 fps (-r 24), frequent keyframes (GOP=12: keyframe every 0.5s for instant seeking),
  // faststart moov atom at beginning of file.
  const cmd = `ffmpeg -y -i "${input}" -an -c:v libx264 -preset slow -crf 20 -g 12 -keyint_min 12 -sc_threshold 0 -r 24 -movflags +faststart -pix_fmt yuv420p "${tempOutput}"`;
  execSync(cmd, { stdio: 'pipe' });

  // Reemplazar original
  fs.unlinkSync(input);
  fs.renameSync(tempOutput, input);

  const stats = fs.statSync(input);
  console.log(`✓ ${name} optimized: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

console.log('--- Video Optimization Complete! ---');
