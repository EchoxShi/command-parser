#!/usr/bin/env node
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const indexPath = join(__dirname, '..', 'dist', 'index.js');

await import(pathToFileURL(indexPath).href);
