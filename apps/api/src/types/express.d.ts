import 'express-serve-static-core';

// Augment Express Request interface to include authenticated user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}
