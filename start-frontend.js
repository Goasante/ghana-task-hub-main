#!/usr/bin/env node
/**
 * Ghana Task Hub Frontend Startup Script
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkNodeVersion() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
        console.log('❌ Node.js 16 or higher is required');
        process.exit(1);
    }
    console.log(`✅ Node.js ${nodeVersion} detected`);
}

function installDependencies() {
    console.log('📦 Installing frontend dependencies...');
    
    return new Promise((resolve, reject) => {
        const npm = spawn('npm', ['install'], { 
            stdio: 'inherit',
            shell: true 
        });
        
        npm.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Dependencies installed successfully');
                resolve();
            } else {
                console.log('❌ Failed to install dependencies');
                reject(new Error('npm install failed'));
            }
        });
    });
}

function setupEnvironment() {
    const envFile = path.join(__dirname, '.env.local');
    const envExample = path.join(__dirname, 'env.local');
    
    if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
        console.log('📝 Creating .env.local file from template...');
        fs.copyFileSync(envExample, envFile);
        console.log('✅ Environment file created');
        console.log('⚠️  Please update .env.local with your actual configuration');
    }
}

function startFrontend() {
    console.log('🚀 Starting Ghana Task Hub Frontend...');
    console.log('📍 Frontend will be available at: http://localhost:3000');
    console.log('🔄 Hot reload enabled for development');
    console.log('=' * 50);
    
    const dev = spawn('npm', ['run', 'start'], { 
        stdio: 'inherit',
        shell: true 
    });
    
    dev.on('close', (code) => {
        console.log(`\n🛑 Frontend server stopped with code ${code}`);
    });
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping frontend server...');
        dev.kill('SIGINT');
    });
}

async function main() {
    console.log('🇬🇭 Ghana Task Hub Frontend Setup');
    console.log('=' * 40);
    
    try {
        checkNodeVersion();
        await installDependencies();
        setupEnvironment();
        
        console.log('\n🎯 Starting frontend server...');
        startFrontend();
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
