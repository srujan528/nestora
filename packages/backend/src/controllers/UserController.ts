import { userService } from '@/services/UserService';
import { Request, Response, NextFunction } from 'express';

class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.userId;
    const profile = await userService.getProfile(userId);
    res.json(profile);
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.userId;
    const { name, phone } = req.body;
    const profile = await userService.updateProfile(userId, { name, phone });
    res.json(profile);
  }
}

export const userController = new UserController();
