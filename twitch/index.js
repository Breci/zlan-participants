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
const userCache = {};

export async function getUsersInfo(usersId) {
  const token = await getAuthToken();

  const usersFromCache = usersId.reduce((reducer, userId) => {
    if (userCache[userId] && userCache[userId].expiresAt > Date.now()) {
      return [...reducer, userCache[userId].data];
    }
    return reducer;
  }, []);

  const users = (
    await Promise.all(
      chunkArray(
        usersId.filter(
          (userId) =>
            !userCache[userId] ||
            (userCache[userId] && userCache[userId].expiresAt < Date.now())
        ),
        100
      ).map((ids) =>
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

  users.forEach((user) => {
    userCache[user.id] = {
      data: user,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };
  });

  return [...usersFromCache, ...users];
}

const gameCache = {};

export async function getGames(gamesId) {
  const token = await getAuthToken();
  const gamesFromCache =
    gamesId.reduce((reducer, gameId) => {
      if (gameCache[gameId] && gameCache[gameId].expiresAt > Date.now()) {
        return [...reducer, gameCache[gameId].data];
      }
      return reducer;
    }, []) || [];
  try {
    const games = (
      await Promise.all(
        chunkArray(
          gamesId.filter(
            (gameId) =>
              !gameCache[gameId] ||
              (gameCache[gameId] && gameCache[gameId].expiresAt < Date.now())
          ),
          100
        ).map((ids) =>
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
    games.forEach((game) => {
      gameCache[game.id] = {
        data: game,
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
      };
    });
    return [...gamesFromCache, ...games];
  } catch (e) {
    // safety if there is a problem on Twitch side
    console.error(e);
    return [];
  }
}
