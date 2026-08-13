const fs = require('fs');
const path = require('path');

// Read all .cpp files in this directory
const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.cpp'));

// Sort files alphabetically so the order is deterministic across deployments
files.sort();

const algorithmsData = files.map(file => {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf-8');
  
  // Extract TITLE and DESCRIPTION from comments
  const titleMatch = content.match(/TITLE:\s*(.*)/);
  const descMatch = content.match(/DESCRIPTION:\s*(.*)/);
  
  return {
    name: titleMatch ? titleMatch[1].trim() : path.basename(file, '.cpp'),
    description: descMatch ? descMatch[1].trim() : 'No description provided.',
    code: content
  };
});

module.exports = algorithmsData;
