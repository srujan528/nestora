import { Request, Response } from 'express';

class PropertyStatsController {
  async getStats(req: Request, res: Response) {
    res.json({});
  }
}

export const propertyStatsController = new PropertyStatsController();
