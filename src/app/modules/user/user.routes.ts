import { UserControllers } from './user.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { userValidation } from './user.validation';
import { Router } from 'express';
import checkAuth from '../../middlewares/checkAuth';

import { multerUpload } from '../../config/multer.config';
import { Role } from './user.interface';

export const router = Router();

router.post(
  '/register',
  multerUpload.single('file'),
  validateRequest(userValidation.createUserZodSchema),
  UserControllers.createUser,
);

router.get('/all-users', checkAuth(Role.SUPER_ADMIN), UserControllers.getAllUsers);
router.get('/me', checkAuth(...Object.values(Role)), UserControllers.getMe);
router.get(
  '/company-profile',
  checkAuth(...Object.values(Role)),
  UserControllers.getMyCompanyProfile,
);

router.patch(
  '/:id',
  checkAuth(...Object.values(Role)),
  multerUpload.single('file'),
  UserControllers.updateUser,
);

export const UserRoutes = router;
