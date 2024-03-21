import { HttpException } from './root';

export class UnautorizedException extends HttpException {
    constructor(message: string, errorCode: number, errors?: any) {
        super(message,errorCode, 401, errors);
    }
}