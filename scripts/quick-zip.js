import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// Simple zip creation
async function createZip() {
    const zipName = `clinic-portal-${Date.now()}.zip`;
    const output = fs.createWriteStream(`./${zipName}`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
        output.on('close', () => {
            const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
            console.log(`✅ Zip created: ${zipName}`);
            console.log(`📏 Size: ${sizeInMB} MB`);
            console.log(`📍 Location: ${path.resolve(zipName)}`);
            resolve();
        });

        archive.on('error', reject);
        archive.pipe(output);

        // Add all files except node_modules and .git
        archive.glob('**/*', {
            ignore: ['node_modules/**', '.git/**', '*.zip', 'dist/**']
        });

        archive.finalize();
    });
}

// Run it
console.log('🚀 Creating zip...');
createZip().then(() => {
    console.log('🎉 Done!');
}).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
}); 