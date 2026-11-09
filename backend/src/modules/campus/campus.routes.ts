import { Router } from 'express';
import { campusController } from './campus.controller';

const router = Router();

router.get('/', campusController.listPublished.bind(campusController));
router.get('/:id', campusController.getById.bind(campusController));

export const campusRoutes = router;
