import { text } from "node:stream/consumers";
import _ from "lodash";
import { OPENAI_APIKEY } from "../../.env";
import router from "../router";
import { serializeJSON } from "../utils";

router.post("/generative", validateJWT, async ({ env, req }) => {
  const { url, title } = await req.json();
  if (!url || typeof url !== "string" || url.trim() === "") {
    return serializeJSON({
      error: "url is required",
    });
  }
  if (!title || typeof title !== "string" || title.trim() === "") {
    return serializeJSON({
      error: "title is required",
    });
  }

  const { readability } = await fetchPageImpl(url);
  if (!readability || !readability.textContent || readability.textContent.trim() === "") {
    return serializeJSON({
      error: "Failed to fetch page",
    });
  }
  const { choices: [{ message: { content } }] } = await generateSummary(title, readability) as any;
  return serializeJSON({
    content,
    readability,
  });
});
async function generateSummary(title: string, readabilityContent: any) {
  const openaiHdrs = new Headers();
  openaiHdrs.append("Content-Type", "application/json");
  openaiHdrs.append("Accept", "application/json");
  openaiHdrs.append("Authorization", `Bearer ${OPENAI_APIKEY}`);

  const raw = JSON.stringify({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "你是我的活动整理助手。我将为你提供活动的标题、作者、所抓取的网页中的正文等信息，然后你将对活动做出总结，并介绍这个活动。\n请你在总结时满足以下要求：\n1. 首先如果页面的标题不是中文的请依据上下文将标题信达雅的翻译为简体中文并放在第一行\n2. 然后从我提供的文章信息中总结出文章的摘要\n3. 最后，请用简体中文进行回复，你回复的消息格式应像这个例句一样（例句中的双花括号为需要替换的内容）：\n{{简体中文标题，可省略}}\n\n摘要：{{文章的摘要}}, 并使用 Markdown 格式",
      },
      {
        role: "user",
        content: `我的第一个要求相关的信息如下：\n\n标题：${title}\n作者：${readabilityContent.author}\n正文：\n\n${readabilityContent.textContent}`,
      },
    ],
    stream: false,
  });

  const requestOptions = {
    method: "POST",
    headers: openaiHdrs,
    body: raw,
    redirect: "follow",
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", requestOptions)
    .then(response => response.json());
  return res;
}
async function fetchPageImpl(url: string, waitUntil = "networkidle2") {
  const realEndpoint = "https://page-render.shizuku.ai";
  const { snapshot, error } = await fetch(realEndpoint, {
    method: "POST",
    body: JSON.stringify({
      url,
      waitUntil,
    }),
  }).then(res => res.json());
  if (error) {
    error.error = error;
    throw error;
  }
  return {
    html: snapshot.html,
    readability: snapshot.parsed,
  };
}
