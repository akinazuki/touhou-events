import type { RouterContext, RouterHandler } from "@tsndr/cloudflare-worker-router";
import { Router } from "@tsndr/cloudflare-worker-router";

export type Var<T = string> = T;
export type Secret<T = string> = T;

export interface Env {
  BUCKET: R2Bucket;
}
export interface ExtReq {

};

export interface ExtCtx {

};
export type Handler = RouterHandler<Env, ExtCtx, ExtReq>;

const router = new Router<Env, ExtCtx, ExtReq>();

router.debug();
router.cors();

export default router;
