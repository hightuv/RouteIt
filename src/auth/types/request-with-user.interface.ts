import { Request } from 'express';

interface UserPayload {
  id: number;
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}
