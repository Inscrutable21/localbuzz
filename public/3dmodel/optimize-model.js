// This is a script you can run to optimize your 3D model
// Install gltf-pipeline: npm install -g gltf-pipeline
// Then run: node optimize-model.js

const fs = require('fs');
const { exec } = require('child_process');

// Run gltf-pipeline to optimize the model
exec('gltf-pipeline -i bumblebee.glb -o bumblebee.optimized.glb --draco.compressionLevel=10', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  
  // Rename the optimized file
  fs.rename('bumblebee.optimized.glb', 'bumblebee.glb', (err) => {
    if (err) throw err;
    console.log('Model optimized and replaced successfully!');
  });
});