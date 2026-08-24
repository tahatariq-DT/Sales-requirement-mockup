const fs=require('fs'), babel=require('@babel/core');
const jsx=fs.readFileSync('app.src.jsx','utf8');
const app=babel.transformSync(jsx,{presets:[['@babel/preset-react',{runtime:'classic'}]]}).code;
fs.writeFileSync('app.compiled.js',app);
console.log('compiled', app.length);
fs.writeFileSync('scan.txt', jsx);
