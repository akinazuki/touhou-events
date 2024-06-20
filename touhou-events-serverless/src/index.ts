import router from "./router";
import "./routes";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return router.handle(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
