import _ from "lodash";
import { GITHUB_REPOSITORY } from "../../.env";
import router from "../router";
import { GitHub, formatMonthDay, sanitizeFileName, serializeJSON, validateJWT } from "../utils";

const exampleObject = {
  id: "CODE-G_ev-25",
  start: 1711152000,
  end: 1711152000,
  title: "CODE-G Vol.25 -MIDNIGHT TOHO MUSIC PARTY-",
  desc: "CODE-G Vol.25 -MIDNIGHT TOHO MUSIC PARTY- 于 东京都涩谷区 nagomix涩谷 举办",
  url: "https://thwiki.cc/CODE-G#ev-25",
  type: [
    "夜店舞会",
  ],
  color: "#3c3f42",
  uniqueId: "4a825bde4d6ae47748f5911a6aaaffa05c291ece6d2f7339ade3bfea23c94b6e",
  location: {
    type: "google",
    text: "东京都涩谷区 nagomix涩谷",
    entity: [
      {
        id: "ChIJGfSRvl6LGGAR5GDIDOVf4Bc",
        addressLine1: "涩谷",
        addressLine2: "日本、東京都渋谷区",
      },
    ],
  },
  platform: 1,
};

router.post("/maintain/editEvent", validateJWT, async ({ env, req }) => {
  try {
    const { content, metadata } = await req.json() as {
      content: any;
      metadata: {
        date: number;
        name: string;
      };
    };

    if (!metadata || !_.conformsTo(metadata, {
      date: (value: any) => {
        const is10Digit = value.toString().length === 10;
        if (!is10Digit)
          throw new Error("metadata.date is not a 10 digit number");
        const isValidDate = new Date(value * 1000).getTime() > 0;
        if (!isValidDate)
          throw new Error("metadata.date is not a valid date");
        if (value !== content.start)
          throw new Error("metadata.date does not match content.start");

        return true;
      },
      name: _.isString,
    })) {
      console.log(metadata);
      throw new Error("metadata is invalid");
    }

    const verifyContentResponse = checkContentError(content);
    const sanitizedDate = new Date(metadata.date * 1000);

    const sanitizedPathName = `${sanitizedDate.getFullYear()}/${formatMonthDay(sanitizedDate)}/${sanitizeFileName(metadata.name, "_")}.json`;
    const gh = new GitHub(GITHUB_REPOSITORY);
    const commitContent = JSON.stringify(content, null, 2);
    const commitMessage = `Update Event [ ${metadata.name} ]\n\nDate: ${sanitizedDate.toISOString()}\n\nMaintainer: [${req.auth.personaname}](https://steamcommunity.com/profiles/${req.auth.steamid})`;
    const res = await gh.writeFile(sanitizedPathName, commitContent, commitMessage);
    return serializeJSON({ success: verifyContentResponse, sanitizedPathName, commitResponse: res });
  }
  catch (error) {
    return serializeJSON({ error: error.message }, 500);
  }
});

function checkContentError(content: any) {
  if (!content)
    throw new Error("$root is empty");
  if (typeof content !== "object")
    throw new Error("$root is not an object");

  const comformsRoot = _.conformsTo(content, {
    id: _.isString,
    start: _.isNumber,
    end: _.isNumber,
    title: _.isString,
    desc: _.isString,
    url: _.isString,
    type: (value: any) => {
      const isValidTypes = Array.isArray(value) && value.every((type: any) => typeof type === "string");
      if (!isValidTypes)
        throw new Error("$root.type is not an array of strings");
      return true;
    },
    color: (value: any) => {
      const validColor = /^#[0-9A-F]{6}$/i.test(value);
      if (!validColor)
        throw new Error("$root.color is not a valid color");
      return true;
    },
    uniqueId: _.isString,
    location: _.isObject,
    platform: _.isNumber,
  });
  if (!comformsRoot)
    throw new Error("$root does not conform to types, check the type of each key");

  const comformsLocation = _.conformsTo(content.location, {
    type: _.isString,
    text: _.isString,
    entity: (value: any) => {
      if (!Array.isArray(value))
        throw new Error("$root.location.entity is not an array");
      if (!value || value.length === 0)
        throw new Error("$root.location.entity[] is empty");
      if (value.length !== 1)
        throw new Error("$root.location.entity[] should have only 1 object");
      return true;
    },
  });
  if (!comformsLocation)
    throw new Error("$root.location does not conform to types, check the type of each key");

  // check if each entity conforms to types
  for (const entity of content.location.entity) {
    const comformsEntity = _.conformsTo(entity, {
      id: _.isString,
      addressLine1: _.isString,
      addressLine2: _.isString,
    });
    if (!comformsEntity)
      throw new Error("$root.location.entity[] does not conform to types, check the type of each key");
  }

  // check if any key is present in content but not in exampleObject
  for (const key in content) {
    if (!(key in exampleObject))
      throw new Error(`$root has key [ ${key} ] which is not accepted`);
  }
  for (const key in content.location) {
    if (!(key in exampleObject.location))
      throw new Error(`$root.location has key [ ${key} ] which is not accepted`);
  }
  for (const key in content.location.entity[0]) {
    if (!(key in exampleObject.location.entity[0]))
      throw new Error(`$root.location.entity[0] has key [ ${key} ] which is not accepted`);
  }
  return true;
}
