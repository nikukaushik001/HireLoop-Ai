import { app } from './app';
import { env } from './config/env';
import './workers';

const startServer = () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`🚀 API Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('🔥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
