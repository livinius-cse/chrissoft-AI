import express, { Request, Response } from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import customersRouter from './routes/customers';
import invoicesRouter from './routes/invoices';
import inventoryRouter from './routes/inventory';
import activitiesRouter from './routes/activities';
import analyticsRouter from './routes/analytics';
import aiRouter from './routes/ai';
import settingsRouter from './routes/settings';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get(['/', '/health', '/api/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ChrisSoft AI Backend Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/settings', settingsRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ChrisSoft AI Backend Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`💼 API Endpoints mounted under /api/*`);
  console.log(`====================================================`);
});

export default app;
