import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';

esbuild
	.build({
		entryPoints: ['src/index.ts'],
		bundle: true,
		outdir: 'dist',
		platform: 'node',
		target: 'node14',
		format: 'cjs',
		minify: true,
		banner: {
			js: '#!/usr/bin/env node',
		},
	})
	.then(() => {
		const distDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'dist');
		const filePath = path.join(distDir, 'index.js');
		const newFilePath = filePath.replace('.js', '.cjs');
		fs.renameSync(filePath, newFilePath);
	})
	.catch((error) => {
		console.error('Error during build:', error);
		process.exit(1);
	});
