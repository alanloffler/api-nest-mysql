import { Request } from 'express';

export interface IActiveUser extends Request {
    id: number;
    email: string;
    role: string;
}
