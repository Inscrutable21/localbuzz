// This is a script you can run to optimize your 3D model
// Install gltf-pipeline: npm install -g gltf-pipeline
// Then run: node optimize-model.js

const fs = require('fs');
const { exec } = require('child_process');

// Run gltf-pipeline to optimize the model with better compression
exec('gltf-pipeline -i bumblebee.glb -o bumblebee.optimized.glb --draco.compressionLevel=10 --draco.quantizePosition=14 --draco.quantizeNormal=10 --draco.quantizeTexcoord=12', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  console.log(`Model optimized successfully!`);
  
  // Create both versions - keep original and optimized
  fs.copyFile('bumblebee.optimized.glb', 'bumblebee.glb', (err) => {
    if (err) throw err;
    console.log('Model optimized and replaced successfully!');
  });
});
