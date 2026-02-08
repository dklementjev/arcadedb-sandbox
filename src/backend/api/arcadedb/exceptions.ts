export interface RequestErrorOptions extends ErrorOptions {
    httpCode: number,
}

export abstract class Exception extends Error {
    public readonly httpCode: number;

    constructor(message: string, options: RequestErrorOptions) {
        super(message, options);

        this.httpCode = options.httpCode;
    }
};

export class RequestException extends Exception {
    constructor(message: string, options: RequestErrorOptions) {
        super(message, options);
    }
}

export class ServerException extends Exception {
    constructor(message: string, options: RequestErrorOptions) {
        super(message, options);
    }
}
