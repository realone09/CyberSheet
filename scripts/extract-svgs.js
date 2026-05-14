const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const searchDir = path.join(__dirname, '../packages/react/src');
const outSvgDir = path.join(__dirname, '../icons/svg');

if (!fs.existsSync(outSvgDir)) {
    fs.mkdirSync(outSvgDir, { recursive: true });
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const svgRegex = /<svg\b[^>]*>[\s\S]*?<\/svg>/gi;
    let match;
    let modified = false;
    let imports = new Set();
    
    const componentName = path.basename(filePath, '.tsx');
    let counter = 1;
    
    // Store matches to avoid modifying while iterating in a way that breaks regex
    const matches = [...content.matchAll(svgRegex)];
    
    // Reverse correctly so replacements don't shift indices
    for (let i = matches.length - 1; i >= 0; i--) {
        const m = matches[i];
        const svgContent = m[0];
        
        let safeName = `${componentName}Icon${i + 1}`;
        
        const svgFileName = `${safeName}.svg`;
        const svgFilePath = path.join(outSvgDir, svgFileName);
        
        fs.writeFileSync(svgFilePath, svgContent);
        
        const start = m.index;
        const end = start + m[0].length;
        content = content.slice(0, start) + `<${safeName} />` + content.slice(end);
        
        imports.add(safeName);
        modified = true;
    }
    
    if (modified) {
        // Will need manual fix ups for any React-specific props like fill="currentColor", but this is a mechanical start
        const importStatements = Array.from(imports).map(name => `import { ${name} } from '../../../../icons/react/${name}'; // Adjust import path as necessary`).join('\n');
        
        content = importStatements + '\n' + content;
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath} - Extracted ${matches.length} SVGs`);
    }
}

console.log('Starting extraction...');
processDirectory(searchDir);
console.log('Extraction complete! SVGs saved to icons/svg');
