import { Router } from 'express';

export interface Controller {
    path: string;
    router: Router;
    authToken?: string;
    // TODO: authorization from user
    register(): void;
}
