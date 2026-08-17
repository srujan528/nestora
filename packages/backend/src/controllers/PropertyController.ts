import { Request, Response } from 'express';

class PropertyController {
  async getProperties(req: Request, res: Response) {
    res.json([]);
  }
}

export const propertyController = new PropertyController();
