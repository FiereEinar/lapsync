import { Router } from 'express';
import {
  createCheckpoint,
  getCheckpointsByEvent,
  updateCheckpoint,
  deleteCheckpoint
} from '../controllers/race-checkpoint.controller';

const router = Router();

router.post('/', createCheckpoint);
router.get('/event/:eventId', getCheckpointsByEvent);
router.put('/:id', updateCheckpoint);
router.delete('/:id', deleteCheckpoint);

export default router;
