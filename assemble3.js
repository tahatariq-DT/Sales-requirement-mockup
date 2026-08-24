const fs=require('fs');
const react=fs.readFileSync('node_modules/react/umd/react.production.min.js','utf8');
const reactDom=fs.readFileSync('node_modules/react-dom/umd/react-dom.production.min.js','utf8');
const css=fs.readFileSync('tw.out.css','utf8');
const images=fs.readFileSync('images.js','utf8');
const app=fs.readFileSync('app.compiled.js','utf8');
const extraCss=`html,body,#root{height:100%;}body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial;}*{scrollbar-width:thin;scrollbar-color:#d4d4d8 transparent;}::-webkit-scrollbar{width:8px;height:8px;}::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:8px;}.fade-in{animation:fi .18s ease-out;}@keyframes fi{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}.slideup{animation:su .22s ease-out;}@keyframes su{from{transform:translateY(100%);}to{transform:none;}}.slidein{animation:sl .22s ease-out;}@keyframes sl{from{transform:translateX(100%);}to{transform:none;}}`;
const html=`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>DigitalTolk — Sales Module (Prototype)</title>
<style>${css}</style><style>${extraCss}</style></head>
<body class="bg-zinc-50 text-zinc-900"><div id="root"></div>
<script>${react}</script><script>${reactDom}</script>
<script>${images}</script>
<script>${app}</script></body></html>`;
fs.writeFileSync('sales_module_prototype.html', html);
console.log('final MB', (html.length/1048576).toFixed(2));
