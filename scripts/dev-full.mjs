import { spawn } from 'child_process';
import process from 'process';

console.log('🚀 Starting SchemaSense Full-Stack Environment...');

// Start Frontend Dev Server
console.log('📦 Starting Vite Dev Server on Port 3000...');
const frontend = spawn('npx', ['vite', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

// Start FastAPI Backend Dev Server
console.log('🐍 Starting FastAPI Backend on Port 8000...');
const backend = spawn('python3', [
  '-m',
  'uvicorn',
  'backend.app:app',
  '--host',
  '0.0.0.0',
  '--port',
  '8000',
], {
  stdio: 'inherit',
  shell: true,
});

// Handle termination to clean up child processes
function killProcesses() {
  console.log('\n🛑 Shutting down SchemaSense full-stack servers...');
  try {
    frontend.kill();
  } catch (e) {}
  try {
    backend.kill();
  } catch (e) {}
  process.exit();
}

process.on('SIGINT', killProcesses);
process.on('SIGTERM', killProcesses);
process.on('exit', killProcesses);

frontend.on('exit', (code) => {
  console.log(`Vite frontend server exited with code ${code}`);
  killProcesses();
});

backend.on('exit', (code) => {
  console.log(`FastAPI backend server exited with code ${code}`);
  killProcesses();
});
