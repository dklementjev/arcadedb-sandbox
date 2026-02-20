import Debug from "npm:debug";
import process from "node:process";
import requestLogger from './middleware/request-logger.ts';
import requestIdGenerator from "./middleware/request-id-generator.ts";
import { ArcadeDB, ManualQuery, QueryLanguage } from "./api/arcadedb.ts";

const debug = Debug("app");

import Router from 'koa-route';
import Koa, { Request } from 'koa';
import bodyParser from "@koa/bodyparser";
import { Exception, RequestException, ServerException } from "./api/arcadedb/exceptions.ts";
import Multer from "@koa/multer";
import { MulterDiskFile } from "./util/multer-types.ts";
import { unlinkOnExit } from "./util/fs.ts";
import { readFile } from "node:fs/promises";
import { send } from "@koa/send";

const app = new Koa();

const listenPort = 9000;
const dbUrl = process.env.DB_URL;
const dbLogin = process.env.DB_LOGIN;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const uploadPath = process.env.UPLOAD_PATH;
const appUrl = process.env.APP_URL;

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
if (!uploadPath) {
    throw new Error("UPLOAD_PATH is empty");
}
if (!appUrl) {
    throw new Error("APP_URL is empty");
}

const db = new ArcadeDB(
    dbUrl,
    dbLogin,
    dbPassword,
);
const multer = Multer({
    dest: uploadPath,
});

const stringifyException = async function (e: Exception): Promise<string> {
    return JSON.stringify({
        httpCode: e.httpCode,
        cause: await e.cause,
    });
}

const generateUploadUrl = function (prefix: string, filename: string): string {
    const normalizeHost = (host: string): string => host.replace(/\/+$/, '',),
        normalizePathSegment = (path:string): string => path.replace(/^\/+/, ''),
        bits = [
            normalizeHost(appUrl),
            normalizePathSegment(prefix),
            filename
        ];

        return bits.join('/');
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

const actionDBImport = async (ctx) => {
    const request = ctx.request as Request,
        response = ctx.response as Response,
        requestFiles = request.files as Record<string, MulterDiskFile[]>,
        mappingFile = requestFiles.mapping,
        dataFile = requestFiles.data
    ;

    debug("dbImport");

    if (mappingFile?.length<1 || dataFile?.length<1) {
        response.status = 400;
        response.body = {
            'success': false,
            'msg': "mapping or data file is missing",
        }
        return;
    }


    unlinkOnExit(
        [
            mappingFile[0].path,
            dataFile[0].path,
        ],
        async () => {
            const postData = {
                mapping: JSON.stringify(JSON.parse((await readFile(mappingFile[0].path)).toString())),
                data: generateUploadUrl('/uploads', dataFile[0].filename),
            }
            debug("post: %o", postData);
            const query = new ManualQuery(
                    QueryLanguage.SQL,
                    `IMPORT DATABASE ${postData.data} WITH mapping=${postData.mapping}`,
                    {},
                    false
                );
            debug("query: %o", query);
            const res = await db.runCommand(
                dbName,
                query
            )


            if (res.status>=400) {
                debug("HTTP status %d, body %o", res.status, await res.json());
            }

            debug("dbImport is done")

            response.body = 'OK';
        }
    )
}

const actionServeUpload = (ctx, filename: string) => {
    debug("serveUpload %s from %s", filename, uploadPath);

    ctx.response.body = send( ctx, filename, {root: uploadPath}) ;
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
app.use(Router.post(
    '/db/import',
    multer.fields([
        {name: "mapping", maxCount: 1},
        {name: "data", maxCount: 1},
    ]),
));
app.use(Router.post(
    '/db/import',
    actionDBImport,
));
app.use(Router.get(
    '/uploads/:filename',
    actionServeUpload,
));
debug("Starting");
app.listen(
    listenPort, (): void => {
        debug('listening on port %s', listenPort);
        debug('Upload path: %s', uploadPath);
    }
);
