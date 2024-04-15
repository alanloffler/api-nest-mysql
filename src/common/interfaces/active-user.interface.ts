import { Request } from 'express';

export interface IActiveUser extends Request {
    email: string;
    id: number;
    role: string;
}
