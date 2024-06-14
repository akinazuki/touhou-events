import "dotenv/config";

const GOOGLE_APIKEY = process.env.GOOGLE_APIKEY;

export async function searchLocation(args) {
  return await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${new URLSearchParams({
    ...args,
    key: GOOGLE_APIKEY,
  })}`).then(res => res.json());
}
