# Project Zip Creation Script

This directory contains scripts for managing the Clinic Portal project.

## Zip Creation Script

The `create-zip.js` script creates a compressed zip file of the entire project, excluding unnecessary files.

### Features

- ✅ **Automatic exclusions**: Excludes `node_modules`, `.git`, build artifacts, and other unnecessary files
- ✅ **Timestamped naming**: Creates unique zip files with timestamps
- ✅ **Maximum compression**: Uses highest compression level for smaller file sizes
- ✅ **Project information**: Includes project details and README in the zip
- ✅ **Progress logging**: Shows which files are being added/excluded

### Usage

#### Method 1: Using npm script (Recommended)
```bash
npm run zip
```

#### Method 2: Direct execution
```bash
node scripts/create-zip.js
```

### What gets included

- ✅ All source code files
- ✅ Configuration files (package.json, vite.config.ts, etc.)
- ✅ Documentation files
- ✅ Public assets
- ✅ Scripts directory

### What gets excluded

- ❌ `node_modules/` directory
- ❌ `.git/` directory and git files
- ❌ Build artifacts (`dist/`, `build/`)
- ❌ Environment files (`.env.local`, etc.)
- ❌ Log files
- ❌ OS-specific files (`.DS_Store`, `Thumbs.db`)
- ❌ Coverage reports
- ❌ Existing zip files

### Output

The script creates a zip file in the `dist/` directory with the naming pattern:
```
Clinic_Portal-YYYYMMDD-HHMMSS.zip
```

Example: `Clinic_Portal-20241201-143022.zip`

### Installation

The script requires the `archiver` package. Install it with:

```bash
npm install archiver
```

### Example Output

```
🚀 Starting project zip creation...
📋 Project: clinic-portal v0.0.0
✅ Created output directory: ./dist
⏭️  Excluding: node_modules
⏭️  Excluding: .git
📄 Adding: package.json
📄 Adding: vite.config.ts
📄 Adding: src/App.tsx
...
✅ Zip file created successfully!
📦 File: Clinic_Portal-20241201-143022.zip
📏 Size: 2.45 MB
📍 Location: /path/to/project/dist/Clinic_Portal-20241201-143022.zip

🎉 Project zip creation completed successfully!
📁 You can find the zip file in: /path/to/project/dist
```

### Customization

You can modify the script to:

1. **Change excluded patterns**: Edit the `EXCLUDE_PATTERNS` array
2. **Change output directory**: Modify the `OUTPUT_DIR` constant
3. **Change naming pattern**: Modify the `ZIP_NAME` template
4. **Add custom README content**: Edit the `readmeContent` template

### Troubleshooting

**Error: "archiver package is not installed"**
```bash
npm install archiver
```

**Error: "Permission denied"**
Make sure you have write permissions in the project directory.

**Large zip file size**
The script already excludes large directories like `node_modules`. If the zip is still large, check if there are other large files that should be excluded. 