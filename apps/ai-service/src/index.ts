import express from 'express';
import { AIService } from '@equation-orchestra/ai';

const app = express();
const port = process.env.PORT || 5001;
const aiService = new AIService();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/recommend-vendors', async (req, res) => {
  const { rfqDetails } = req.body;
  const recommendations = await aiService.recommendVendors(rfqDetails);
  res.json({ recommendations });
});

app.post('/forecast-demand', async (req, res) => {
  const { productId } = req.body;
  const forecast = await aiService.forecastDemand(productId);
  res.json({ forecast });
});

app.listen(port, () => {
  console.log(`AI microservice listening on port ${port}`);
});
