import { handleChat, type ChatEnv } from "./chat";
import { handleFeedback, type FeedbackEnv } from "./feedback";
interface Env extends FeedbackEnv, ChatEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/api/feedback" || path === "/api/feedback/session")
      return handleFeedback(request, env);
    if (path === "/api/chat" || path.startsWith("/api/chat/"))
      return handleChat(request, env);
    if (path.startsWith("/api/"))
      return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
