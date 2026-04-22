const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let changed = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content
    .replace(/blue-600/g, 'primary')
    .replace(/blue-700/g, 'primary-fixed-variant')
    .replace(/blue-50/g, 'primary-fixed')
    .replace(/blue-100/g, 'primary-fixed-dim')
    .replace(/blue-500/g, 'primary')
    .replace(/text-white/g, 'text-on-primary');
    
  if(content !== newContent) {
    fs.writeFileSync(f, newContent);
    changed++;
  }
});

console.log('Updated ' + changed + ' files to use primary colors.');
