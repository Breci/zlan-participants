import axios from "axios";

function chunkArray(myArray, chunk_size) {
  const arrayLength = myArray.length;
  const tempArray = [];

  for (let index = 0; index < arrayLength; index += chunk_size) {
    const myChunk = myArray.slice(index, index + chunk_size);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
}

let token = null;

async function getAuthToken() {
  if (token && token.expired_at * 1000 > Date.now() - 1000 * 60 * 60) {
    return token.access_token;
  }
  const t = await axios
    .post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`
    )
    .then((resp) => resp.data);

  token = {
    ...t,
    expired_at: Date.now() + t.expires_in * 1000,
  };
  return t.access_token;
}

export async function getLiveStreams(streamsId) {
  const token = await getAuthToken();

  const streams = (
    await Promise.all(
      chunkArray(streamsId, 100).map((ids) =>
        axios
          .get("https://api.twitch.tv/helix/streams", {
            params: {
              user_login: ids,
              first: 100,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              "Client-ID": process.env.TWITCH_CLIENT_ID,
            },
          })
          .then((resp) => resp.data.data)
      )
    )
  ).flat();
  return streams;
}

// TODO build a cache for users to avoid too many refetch
const userInfoCache = {};

export async function getUsersInfo(streamsId) {
  const token = await getAuthToken();

  const users = (
    await Promise.all(
      chunkArray(streamsId, 100).map((ids) =>
        axios
          .get("https://api.twitch.tv/helix/users", {
            params: {
              id: ids,
              first: 100,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              "Client-ID": process.env.TWITCH_CLIENT_ID,
            },
          })
          .then((resp) => resp.data.data)
      )
    )
  ).flat();
  return users;
}

// TODO set cache for games

export async function getGames(gamesId) {
  const token = await getAuthToken();
  console.log({ gamesId });
  const games = (
    await Promise.all(
      chunkArray(gamesId, 100).map((ids) =>
        axios
          .get("https://api.twitch.tv/helix/games", {
            params: {
              id: ids,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              "Client-ID": process.env.TWITCH_CLIENT_ID,
            },
          })
          .then((resp) => resp.data.data)
      )
    )
  ).flat();
  return games;
}
