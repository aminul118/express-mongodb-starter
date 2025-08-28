import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

const notFound = (req: Request, res: Response) => {
  const route = req.url;

  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: `${route} Route Not found`,
  });
};

export default notFound;
