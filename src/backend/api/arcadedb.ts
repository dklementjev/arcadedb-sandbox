import Debug from "npm:debug";
import { encodeBase64 } from "@std/encoding/base64";
import { ulid } from "@std/ulid";

const debug = Debug("app.arcadedb");

export class Transaction {
    constructor (
        public readonly id: string,
    ) {}
}

export enum QueryLanguage {
    Cypher = 'cypher',
    GraphQL = 'graphql',
    Gremlin = 'gremlin',
    Mongo = 'mongo',
    SQL = 'sql',
    SQLscript = 'sqlscript',
};

export enum QuerySerializer {
    Graph = 'graph',
    Record = 'record',
    Studio = 'studio',
};

type RequestHeaders = Record<string, string>;

interface SerializedQuery {
    language: QueryLanguage,
    command: string,
    params: QueryParams,
    serializer?: string,
}

export type QueryParams = Record<string, string|number|boolean|null>;

export interface Query {
    getLanguage(): QueryLanguage;

    getQuery(): string;

    getParams(): QueryParams;

    isIdempotent(): boolean;
}

export interface QueryResult {}

export abstract class CommonQuery implements Query {
    constructor (
        protected readonly language: QueryLanguage,
        protected readonly query: string,
        protected readonly params: QueryParams = {},
        protected readonly idempotent: boolean = true,
    ) {}

    getLanguage (): QueryLanguage {
        return this.language;
    }

    getQuery(): string {
        return this.query;
    }

    getParams(): QueryParams {
        return this.params;
    }

    isIdempotent(): boolean {
        return this.idempotent;
    }
}

export class ManualQuery extends CommonQuery {}

export class ArcadeDB {
    constructor (
        protected readonly apiUrl: string,
        protected readonly login: string,
        protected readonly password: string,
    ) {}

    isReady (): Promise<boolean|null> {
        return this.get('/ready')
            .then(
                (response) => response.status === 204,
                () => null,
            )
        ;
    }

    runQuery (dbName: string, query: Query, serializer: QuerySerializer = QuerySerializer.Studio): Promise<Response> {
        const  path = `/query/${dbName}`,
            data = this.serializeQuery(query, serializer),
            headers = {}
        ;

        return this.post(
            path,
            JSON.stringify(data),
            this.addAuthorizationHeaders(headers),
        );
    }

    runCommand (dbName: string, command: Query, serializer: QuerySerializer = QuerySerializer.Studio): Promise<Response> {
        const path = `/command/${dbName}`,
            data = this.serializeQuery(command, serializer),
            headers = {
                "Content-Type": "application/json",
            }
        ;

        return this.post(
            path,
            JSON.stringify(data),
            this.addAuthorizationHeaders(headers),
        );
    }

    beginTransaction (dbName: string): Promise<Transaction|null> {
        const path = `/begin/${dbName}`,
            headers = {}
        ;

        return this.post(
            path,
            null,
            this.addAuthorizationHeaders(headers)
        )
        .then((response) => {
            const sessionId = response.headers.get('arcadedb-session-id');

            return sessionId ? new Transaction(sessionId) : null;
        })
    }

    commitTransaction (dbName: string, transaction: Transaction): Promise<Response> {
        const path = `/commit/${dbName}`,
            headers = {
                'arcadedb-session-id': transaction.id,
            }
        ;

        return this.post(
            path,
            null,
            this.addAuthorizationHeaders(headers),
        );
    }

    rollbackTransaction (dbName: string,transaction: Transaction): Promise<Response> {
        const path = `/rollback/${dbName}`,
            headers = {
                'arcadedb-session-id': transaction.id,
            }
        ;

        return this.post(
            path,
            null,
            this.addAuthorizationHeaders(headers),
        );
    }

    protected get (path: string, headers?: RequestHeaders): Promise<Response> {
        return this.request('GET', path, null, headers);
    }

    protected post (path: string, data: string|null, headers?: RequestHeaders): Promise<Response> {
        return this.request('POST', path, data, headers);
    }

    protected request (method: string, path: string, data: string|null, headers?: RequestHeaders): Promise<Response> {
        const requestId = ulid();

        return Promise.resolve()
            .then(
                () => {
                    const endpoint = this.getUrl(path);
                    debug("%o", {method: "request", requestId: requestId, httpMethod: method, endpoint: endpoint});

                    return fetch(
                        endpoint,
                        {
                            method: method,
                            body: data,
                            headers: headers,
                        }
                    );
                }
            )
            .then(
                (response) => {
                    debug("%o", {method: "request", requestId: requestId, handler: "then", httpStatus: response.status ?? null});

                    return response;
                },
                (err) => {
                    debug("%o", {method: "request", requestId: requestId, handler: "catch", error: err});

                    return Promise.reject(err);
                }
            )
        ;
    }

    protected serializeQuery(query: Query, serializer: QuerySerializer = QuerySerializer.Studio): SerializedQuery {
        return {
            language: query.getLanguage(),
            command: query.getQuery(),
            params: query.getParams(),
            serializer: serializer,
        };
    }

    protected addAuthorizationHeaders(headers: RequestHeaders): RequestHeaders {
        const authHeaders = {
            'Authorization': 'Basic '  + encodeBase64([this.login, this.password].join(':')),
        };

        return {
            ...headers,
            ...authHeaders,
        };
    }

    protected getUrl(path: string): string {
        const normalizedPath = path.replace(/^\/+/, '');

        return `${this.apiUrl}/api/v1/${normalizedPath}`;
    }
}
