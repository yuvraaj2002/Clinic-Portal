# Development Guide

## Preventing Unused Imports and Variables

This project is configured to catch unused imports and variables early in development to prevent build failures during deployment.

### Quick Fix Commands
```bash
# Fix all unused imports automatically
npm run fix-unused

# Run ESLint with auto-fix
npm run lint:fix

# Check for issues without fixing
npm run lint
```

### Configuration

The project uses several tools to prevent unused imports:

1. **TypeScript Configuration** (`tsconfig.json`):
   - `noUnusedLocals: true` - Reports errors on unused local variables
   - `noUnusedParameters: true` - Reports errors on unused parameters

2. **ESLint Configuration** (`.eslintrc.json`):
   - `unused-imports/no-unused-imports: "error"` - Removes unused imports
   - `@typescript-eslint/no-unused-vars: "error"` - Reports unused variables

3. **Pre-commit Hooks** (`.husky/pre-commit`):
   - Automatically runs linting before each commit
   - Prevents commits with unused imports/variables

### Common Issues and Solutions

#### 1. Unused Imports
```typescript
// ❌ Bad - unused import
import { Button, Card, Modal } from '@heroui/react';

// ✅ Good - only import what you use
import { Button, Card } from '@heroui/react';
```

#### 2. Unused Variables
```typescript
// ❌ Bad - unused variable
const [data, setData] = useState(null);

// ✅ Good - prefix with underscore if intentionally unused
const [_data, setData] = useState(null);
```

#### 3. Unused Parameters
```typescript
// ❌ Bad - unused parameter
const handleClick = (event: MouseEvent) => {
  console.log('clicked');
};

// ✅ Good - prefix with underscore
const handleClick = (_event: MouseEvent) => {
  console.log('clicked');
};
```

### IDE Setup

For the best development experience, install these VS Code extensions:
- ESLint
- TypeScript Importer
- Auto Rename Tag

### Before Deployment

Always run these commands before deploying:

```bash
npm run lint
npm run build
```

This ensures your code is clean and will build successfully in production. 