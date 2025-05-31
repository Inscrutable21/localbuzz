const { NodeIO } = require('@gltf-transform/core');
const { draco, quantize, textureCompress } = require('@gltf-transform/functions');
const path = require('path');

async function optimizeModel() {
  const io = new NodeIO();
  
  // Read the model
  const document = await io.read(path.join(__dirname, '../public/3dmodel/bumblebee.glb'));
  
  // Apply optimizations
  await document.transform(
    // Quantize positions, normals, and UVs
    quantize({
      pattern: /^(POSITION|NORMAL|TEXCOORD)$/,
      bits: 14
    }),
    // Compress textures
    textureCompress({
      targetFormat: 'webp',
      quality: 0.8
    }),
    // Apply Draco compression
    draco({
      method: 'edgebreaker',
      encodeSpeed: 5,
      decodeSpeed: 5,
      quantizePosition: 14,
      quantizeNormal: 10,
      quantizeTexcoord: 12
    })
  );
  
  // Write the optimized model
  await io.write(
    path.join(__dirname, '../public/3dmodel/bumblebee-optimized.glb'),
    document
  );
  
  console.log('Model optimization complete!');
}

optimizeModel().catch(console.error); 