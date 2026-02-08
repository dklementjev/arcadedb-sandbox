import Debug from "npm:debug";
import process from "node:process";
import requestLogger from './middleware/request-logger.ts';
import requestIdGenerator from "./middleware/request-id-generator.ts";
import { ArcadeDB, ManualQuery, QueryLanguage } from "./api/arcadedb.ts";

const debug = Debug("app");

import Router from 'koa-route';
import Koa from 'koa';
import bodyParser from "@koa/bodyparser";
import { Exception, RequestException, ServerException } from "./api/arcadedb/exceptions.ts";

const app = new Koa();

const listenPort = 9000;
const dbUrl = process.env.DB_URL;
const dbLogin = process.env.DB_LOGIN;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

if (!dbUrl) {
    throw new Error('DB_URL is empty');
}
if (!dbLogin) {
    throw new Error('DB_LOGIN is empty');
}
if (!dbPassword) {
    throw new Error('DB_PASSWORD is empty');
}
if (!dbName) {
    throw new Error('DB_NAME is empty');
}

const db = new ArcadeDB(
    dbUrl,
    dbLogin,
    dbPassword,
);

const stringifyException = async function (e: Exception): string {
    return JSON.stringify({
        httpCode: e.httpCode,
        cause: await e.cause,
    });
}

const actionPing = (ctx) => {
    ctx.body = "OK";
}

const actionDBPing = async (ctx) => {
    const isDBReady = await db.isReady();

    ctx.body = {
        success: true,
        status: isDBReady,
    };
}

const actionDBQuery = async (ctx) => {
    const language = ctx.request?.body?.language,
        query = ctx.request?.body?.query
    ;

    if (!ctx.is('application/json')) {
        ctx.throw(400, 'Invalid content-type');
    }
    if (!Object.values(QueryLanguage).includes(language)) { // TODO: validator ?
        ctx.throw(400, 'Query language is empty or invalid ' + language);
    }
    if (!query) {
        ctx.throw(400, 'Query is empty');
    }

    const dbQuery = new ManualQuery(
        language,
        query
    );

    try {
        const queryResult = await db.runQuery(dbName, dbQuery);

        if (queryResult.status >= 400 && queryResult.status<500) {
            throw new RequestException('Request error', {httpCode: queryResult.status, cause: queryResult.json()}) ;
        }
        if (queryResult.status >= 500) {
            throw new ServerException('Server error', {httpCode: queryResult.status, cause: queryResult.json()});
        }
        const json = await queryResult.json();

        ctx.response.body = {data: json.result ?? null};
    } catch (e) {
        if (e instanceof RequestException) {
            debug("%o", {httpStatus: "4xx", exception: await stringifyException(e)});
            ctx.throw(400);
        }
        if (e instanceof ServerException) {
            debug("%o", {httpStatus: "5xx", exception: await stringifyException(e)});
            ctx.throw(400);
        }
    }
}

app.use(requestIdGenerator);
app.use(requestLogger);
app.use(bodyParser({
    enableTypes: ['json'],
    jsonLimit: '8mb',
    jsonStrict: true,
}));
app.use(Router.get('/', actionPing))
app.use(Router.get('/db/', actionDBPing));
app.use(Router.post('/db/query', actionDBQuery));

debug("Starting");
app.listen(
    listenPort, (err) => {
        if (err) throw new Error(err);
        debug(`listening on port ${listenPort}`);
    }
);
