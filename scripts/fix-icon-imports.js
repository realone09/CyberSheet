const fs = require('fs');
const path = require('path');

function getAllTsxFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            getAllTsxFiles(filePath, fileList);
        } else if (filePath.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    }
    
    return fileList;
}

const reactSrcDir = path.join(__dirname, '../packages/react/src');
const files = getAllTsxFiles(reactSrcDir);

console.log('Updating icon import paths to use @cyber-sheet/icons/react alias...\n');

for (const fullPath of files) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Check if the file has the relative icon imports
    if (content.includes("from '../../../icons/react'")) {
        content = content.replace(/from '..\/..\/..\/icons\/react'/g, "from '@cyber-sheet/icons/react'");
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(fullPath, content);
        const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
        console.log(`✅ Updated ${relativePath}`);
    }
}

console.log('\n✅ All import paths updated successfully!');
