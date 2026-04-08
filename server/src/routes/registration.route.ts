import { Router } from 'express';
import { getRegistrationsHander, adminRegisterHandler } from '../controllers/registration.controller';

const router = Router();

router.get('/', getRegistrationsHander);
router.post('/admin-add', adminRegisterHandler);

export default router;
