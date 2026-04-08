import express from 'express';
import { updateProfileHandler, searchUsersHandler } from '../controllers/user.controller';

const router = express.Router();

router.patch('/', updateProfileHandler);
router.get('/search', searchUsersHandler);

export default router;
