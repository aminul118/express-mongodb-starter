import { Router } from 'express';
import { ContactController } from './contact.controller';

const router = Router();

router.post('/create', ContactController.createContact);

export const ContactRouter = router;
