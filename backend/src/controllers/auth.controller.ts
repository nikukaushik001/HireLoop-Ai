import { Request, Response, NextFunction } from 'express';
import { AuthService, RegisterDTO, LoginDTO } from '../services/auth.service';
import { sendSuccess } from '../utils/api-response';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as RegisterDTO;
      const tokens = await authService.register(data);
      sendSuccess(res, tokens, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LoginDTO;
      const tokens = await authService.login(data);
      sendSuccess(res, tokens, 200);
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user is populated by the auth middleware
      sendSuccess(res, req.user, 200);
    } catch (error) {
      next(error);
    }
  }
}
