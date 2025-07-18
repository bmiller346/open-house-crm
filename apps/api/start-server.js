const { register } = require('ts-node');

// Register TypeScript
register({
  transpileOnly: true,
  project: './tsconfig.json',
  compilerOptions: {
    experimentalDecorators: true,
    emitDecoratorMetadata: true
  }
});

// Import and run the server
require('./src/server.ts');
