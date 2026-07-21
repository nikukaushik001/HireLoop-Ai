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

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) throw new Error('Token is required');
      const tokens = await authService.googleLogin(token);
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

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const origin = req.headers.origin;
      const result = await authService.forgotPassword(email, origin);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}
