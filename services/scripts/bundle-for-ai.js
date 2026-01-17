const fs = require('fs');
const path = require('path');

const outputFileName = 'KAIROS_FULL_CODE_CONTEXT.md';
const searchDirs = [
    './services',
    './scripts',
    '.' // Root for specific files
];

// Archivos específicos en la raíz que queremos incluir
const rootFilesToInclude = [
    'fill-db-automated.js',
    'types.ts',
    'supabaseClient.ts',
    'package.json',
    'tsconfig.json',
    'vite.config.ts'
];

// Extensiones permitidas para escanear carpetas
const allowedExtensions = ['.ts', '.js', '.tsx', '.json', '.sql', '.md'];

let outputContent = `# KAIROS PROJECT CONTEXT\nGenerated on: ${new Date().toISOString()}\n\n`;

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.gemini') continue;
            processDirectory(fullPath);
        } else {
            // Filtrar por extensión o inclusión explícita
            const ext = path.extname(file);
            const isRoot = dir === '.';

            let shouldInclude = false;

            if (isRoot) {
                shouldInclude = rootFilesToInclude.includes(file);
            } else {
                shouldInclude = allowedExtensions.includes(ext);
            }

            if (shouldInclude) {
                console.log(`Adding: ${fullPath}`);
                const content = fs.readFileSync(fullPath, 'utf8');
                outputContent += `\n# FILE: ${fullPath.replace(/\\/g, '/')}\n\`\`\`${ext.replace('.', '')}\n${content}\n\`\`\`\n`;
            }
        }
    }
}

// Ejecutar proceso
console.log('📦 Empaquetando código para AI Studio...');

searchDirs.forEach(dir => {
    if (dir === '.') {
        // Para root, procesamos solo los archivos específicos para no escanear todo recursivametne mal
        rootFilesToInclude.forEach(f => {
            if (fs.existsSync(f)) {
                console.log(`Adding Root File: ${f}`);
                const content = fs.readFileSync(f, 'utf8');
                const ext = path.extname(f);
                outputContent += `\n# FILE: ${f}\n\`\`\`${ext.replace('.', '')}\n${content}\n\`\`\`\n`;
            }
        });
    } else {
        processDirectory(dir);
    }
});

fs.writeFileSync(outputFileName, outputContent);
console.log(`\n✅ ¡LISTO! Todo el código está en: ${outputFileName}`);
console.log('   -> Sube este único archivo a AI Studio.');
