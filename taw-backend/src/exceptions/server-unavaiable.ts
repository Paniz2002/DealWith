import { HttpException } from './root';

export class ServerUnavaiable extends HttpException {
    constructor(message: string, errorCode: any) {
        super(message,errorCode, 500, null);
    }
}