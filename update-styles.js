const fs = require('fs');
const path = require('path');

const stylesDir = path.join(__dirname, 'src', 'styles');

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace border-radius (ignoring 50% for circles like loading spinners/avatars)
  content = content.replace(/border-radius:\s*(?!50%)[^;]+;/gi, 'border-radius: 0;');
  
  // Replace blue colors with red colors across the system
  content = content.replace(/#3b82f6/gi, '#dc2626'); // blue-500 to red-600
  content = content.replace(/#2563eb/gi, '#dc2626'); // blue-600 to red-600
  content = content.replace(/#1d4ed8/gi, '#b91c1c'); // blue-700 to red-700
  content = content.replace(/#0e48f1/gi, '#dc2626'); // custom primary blue to red-600
  content = content.replace(/#0c3dcc/gi, '#b91c1c'); // custom primary-dark blue to red-700

  // Replace rgba variants
  content = content.replace(/rgba\(59,\s*130,\s*246/g, 'rgba(220, 38, 38');
  content = content.replace(/rgba\(37,\s*99,\s*235/g, 'rgba(220, 38, 38');
  
  fs.writeFileSync(filePath, content, 'utf8');
};

const files = fs.readdirSync(stylesDir);
files.forEach(file => {
  if (file.endsWith('.css')) {
    replaceInFile(path.join(stylesDir, file));
  }
});
console.log("✅ All CSS files updated: Switched to red logo colors & applied sharp corners!");
