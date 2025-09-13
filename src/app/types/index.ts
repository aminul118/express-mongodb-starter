import { Router } from 'express';

export type { SendEmailOptions } from './email.types';

export interface IModuleRoutes {
  path: string;
  element: Router;
}
