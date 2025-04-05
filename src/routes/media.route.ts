import { Router } from 'express';
import authMiddleware from '../utils/AuthMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', (_req, res)=>{
    res.status(501).send()
});

router.post('/addMedia', (_req, res)=>{
    res.status(501).send()
});

router.get('/:id', (_req, res)=>{
    res.status(501).send()
});


export default router;