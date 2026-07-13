import { Request, Response } from 'express';
import { AuthService, RegisterDTO, LoginDTO } from './auth.service';
import { sendSuccess } from '../../utils/api-response';

const authService = new AuthService();

export class AuthController {
  
  /**
   * Register a new admin user and organization.
   */
  async register(req: Request, res: Response) {
    const data = req.body as RegisterDTO;
    
    // Pass to service layer
    const tokens = await authService.register(data);
    
    // We can set the refresh token as an HTTP-only cookie for security,
    // or just return it in the JSON body for the client to store.
    sendSuccess(res, tokens, 201);
  }

  /**
   * Login with email and password.
   */
  async login(req: Request, res: Response) {
    const data = req.body as LoginDTO;
    
    const tokens = await authService.login(data);
    
    sendSuccess(res, tokens, 200);
  }

  /**
   * Refresh an access token using a valid refresh token.
   */
  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    
    const accessToken = await authService.refresh(refreshToken);
    
    sendSuccess(res, { accessToken }, 200);
  }

  /**
   * Logout the user.
   */
  async logout(req: Request, res: Response) {
    // req.user is guaranteed to exist here because this route 
    // will be protected by the auth middleware
    const userId = req.user!.id;
    
    await authService.logout(userId);
    
    sendSuccess(res, null, 200);
  }

  /**
   * Get current authenticated user profile.
   */
  async me(req: Request, res: Response) {
    // Return the user data attached to the request by the auth middleware
    sendSuccess(res, req.user, 200);
  }
}
