import { BaseContext } from "koa";
import Debug from "npm:debug";

const debug = Debug('app.request');

const requestLogger = async (ctx: BaseContext, next: () => void) => {
    const req = ctx.request,
        resp = ctx.response,
        qs = req.querystring ? `?${req.querystring}` : ''
    ;

    debug("%o", {requestId: req.requestId, method: req.method, path: req.path, qs: qs});
    await next();
    debug("%o", {requestId: req.requestId, status: resp.status});
}

export default requestLogger;
