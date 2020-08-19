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

async function getAuthToken() {
  // TODO optimize that
  return axios
    .post(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`
    )
    .then((resp) => resp.data.access_token);
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
export async function getUsersInfo(streamsId) {
  const token = await getAuthToken();

  const users = (
    await Promise.all(
      chunkArray(streamsId, 100).map((ids) =>
        axios
          .get("https://api.twitch.tv/helix/users", {
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
  return users;
}
