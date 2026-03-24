const { spawn } = require('child_process');
const path = require('path');

/**
 * Enhanced Reboot Script for Messenger Bot
 * - Prevents crash loops with delayed restarts
 * - Maximizes uptime by handling exits gracefully
 */

function start() {
    console.log('Starting Messenger Bot...');
    const child = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    child.on('close', (code) => {
        // If it exited with code 0 or 1 (usually intentional restart), use short delay
        // If it crashed or was killed, use 10s delay to stabilize
        const delay = (code === 0 || code === 1) ? 2000 : 10000;
        console.log(`Bot process exited with code ${code}. Restarting in ${delay/1000}s...`);
        setTimeout(start, delay);
    });

    child.on('error', (err) => {
        console.error('Failed to start bot:', err);
        setTimeout(start, 20000); 
    });

    // Cleanup child process on script exit
    process.on('SIGINT', () => { child.kill(); process.exit(); });
    process.on('SIGTERM', () => { child.kill(); process.exit(); });
}

start();
