// message, status code, error codes, error

export class HttpException extends Error {
    message:string;
    errorCode:any;
    statusCode:number;
    errors: ErrorCode;

    constructor(message:string, errorCode:ErrorCode, statusCode:number, error:any) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.errors = error;
    }
}

export enum ErrorCode {
    USER_NOT_FOUND = 1001,
    USER_ALREADY_EXISTS = 1002,
    INCORRECT_PASSWORD = 1003,
    USER_NOT_EXISTS = 1004,
    SERVER_UNAVAIABLE = 2001,
}