export {}; // Ensure this is treated as a module

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        organizationId: string;
        role: 'admin' | 'recruiter' | 'interviewer';
      };
    }
  }
}
