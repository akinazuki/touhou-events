import _ from "lodash";
import { GITHUB_REPOSITORY } from "../../.env";
import router from "../router";
import { GitHub, serializeJSON } from "../utils";

router.get("/search", async ({ env, req }) => {
  const { q, per_page, page } = req.query as {
    q: string;
    per_page: string;
    page: string;
  };
  if (!_.isString(q) || q.length < 1)
    throw new Error("q is not a string or is less than 1 characters");

  const gh = new GitHub(GITHUB_REPOSITORY);
  const searchResults = await gh.search(q, Number.parseInt(page), Number.parseInt(per_page));
  return serializeJSON(searchResults);
});
