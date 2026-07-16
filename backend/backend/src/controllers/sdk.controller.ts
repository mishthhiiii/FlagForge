import { Request, Response, NextFunction } from 'express';
import { SdkService } from '../services/sdk.service';

export class SdkController {
  static async getFlags(req: Request, res: Response, next: NextFunction) {
    try {
      const sdkKey = req.headers['x-sdk-key'] as string;
      if (!sdkKey) {
        return res.status(401).json({ error: 'Missing x-sdk-key header' });
      }

      const flags = await SdkService.getFlagsBySdkKey(sdkKey);
      res.status(200).json(flags);
    } catch (error) {
      next(error);
    }
  }

  static async evaluateFlag(req: Request, res: Response, next: NextFunction) {
    try {
      const sdkKey = req.headers['x-sdk-key'] as string;
      if (!sdkKey) {
        return res.status(401).json({ error: 'Missing x-sdk-key header' });
      }

      const { flagKey } = req.params;
      const context = req.body.context || {};

      const result = await SdkService.evaluateFlag(sdkKey, flagKey, context);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
