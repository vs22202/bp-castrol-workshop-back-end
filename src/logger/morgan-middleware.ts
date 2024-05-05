import morgan, {FormatFn,TokenIndexer} from "morgan";
import express from "express";
import {logger} from "./logger";

morgan.token('id', (req, res: express.Response) => {
    return res.locals.errorId
});
type CustomTokens = TokenIndexer<express.Request, express.Response>
const incomingMessage: FormatFn<express.Request, express.Response> = (tokens: CustomTokens, req: express.Request, res:express.Response) => {
    return [
        tokens.id(req, res),
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')
}

const infoStream = {
    write: (message: string) => logger.info(message)
}

const errorStream = {
    write: (message: string) => logger.error(message)
}

export const infoMorgan = morgan(incomingMessage, {
    stream: infoStream, immediate: true
});

export const errorMorgan = morgan((tokens, req:express.Request, res:express.Response) => {
    return [
        incomingMessage(tokens, req, res),
        res.locals.errorMessage,
        res.locals.errorStack
    ].join(' ');
}, {
    stream: errorStream, skip(req: express.Request, res: express.Response): boolean {
        return res.statusCode < 400
    }
});