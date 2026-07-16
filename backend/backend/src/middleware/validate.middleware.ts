import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hasRequestShape = schema.shape && ('body' in schema.shape || 'query' in schema.shape || 'params' in schema.shape);
      
      if (hasRequestShape) {
        const parsed = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.query !== undefined) req.query = parsed.query;
        if (parsed.params !== undefined) req.params = parsed.params;
      } else {
        const parsedBody = await schema.parseAsync(req.body);
        req.body = parsedBody;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.').replace('body.', '').replace('query.', '').replace('params.', ''),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
