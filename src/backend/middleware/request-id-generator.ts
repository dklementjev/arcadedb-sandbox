import { ulid } from "@std/ulid";
import { BaseContext } from "koa";

export default async (ctx: BaseContext, next: () => void ) => {
    ctx.request.requestId = ulid()
    await next()
    ctx.response.set('X-Request-Id', ctx.request.requestId);
}
