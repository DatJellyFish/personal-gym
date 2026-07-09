import path from 'path';
import express from 'express';
import cors from 'cors';
import { workoutsRouter } from './routes/workouts';
import { exercisesRouter } from './routes/exercises';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(__dirname, '..', '..', 'public');

app.use(cors());
app.use(express.json());

app.use('/api/workouts', workoutsRouter);
app.use('/api/exercises', exercisesRouter);

app.use(express.static(PUBLIC_DIR));

app.listen(PORT, () => {
  console.log(`ForgeFit server listening on port ${PORT}`);
});
