import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import tickRouter from './routes/tick';
const app = express();
app.use(express.json());

app.use('/api/tick', tickRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});