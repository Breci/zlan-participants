import Head from "next/head";
import styles from "../styles/Home.module.scss";
import { getGames, getLiveStreams, getUsersInfo } from "../twitch";
import { getStreamers } from "../utils";
import { useEffect, useMemo, useState } from "preact/hooks";
import Switch from "../ui/Switch";

const ZLAN_GAMES = [
  "30921", // rocket league
  "493036", // worms
  "633127529", // riders republic
  "1286420756", // pro soccer online
  "512980", // fall guys
  "", // zutom
  "512953", // elden ring
  "511224", // apex legend
  "498482", // AOE 4
  "1086433424", // hot wheels
  "1716516651", // hot wheel (duplicate game)
];

const ZLAN_GAME_FILTER_KEY = "ZLAN_GAME_FILTER";

export default function Home({ streams, users, games }) {
  const usersInfo = useMemo(() => {
    return streams.map((stream) => {
      return {
        stream: stream,
        user: users.find((u) => u.id === stream.user_id),
      };
    });
  }, [streams, users]);

  const [filterByZLANGames, setFilterByZLANGames] = useState(false);

  useEffect(() => {
    setFilterByZLANGames(
      localStorage &&
        localStorage.getItem(ZLAN_GAME_FILTER_KEY) &&
        localStorage.getItem(ZLAN_GAME_FILTER_KEY) === "true"
    );
  }, []);

  const filteredUserInfo = useMemo(() => {
    if (!filterByZLANGames) return usersInfo;

    return usersInfo.filter((info) => ZLAN_GAMES.includes(info.stream.game_id));
  }, [usersInfo, filterByZLANGames]);

  return (
    <div className={styles.container}>
      <Head>
        <title>ZLAN</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <img src="https://www.z-lan.fr/wp-content/uploads/2022/02/logo_zlan_white.svg" />
        </h1>

        <div className={styles.listHeader}>
          <div className={styles.description}>Participants</div>
          <div className={styles.filter}>
            <span className={styles.filterText}>Jeux ZLAN</span>

            <Switch
              checked={filterByZLANGames}
              onChange={(e) => {
                setFilterByZLANGames(e.target.checked);
                if (localStorage) {
                  localStorage.setItem(
                    ZLAN_GAME_FILTER_KEY,
                    e.target.checked.toString()
                  );
                }
              }}
            />
          </div>
        </div>

        <div className={styles.list}>
          {filteredUserInfo.map((userInfo) => (
            <div>
              {" "}
              <a
                target="_blank"
                rel="noreferrer noopener"
                href={`https://www.twitch.tv/${userInfo.user.login}`}
                className={styles.preview}
              >
                <div
                  className={styles["anim-container"]}
                  style="position: relative"
                >
                  <div className={styles["top-left-corner"]}></div>
                  <div className={styles["left-side"]}></div>
                  <div className={styles["bottom-side"]}></div>
                  <div className={styles["bottom-right-corner"]}></div>
                  <div className={styles["img-container"]}>
                    <img
                      src={userInfo.stream.thumbnail_url
                        .replace("{width}", "800")
                        .replace("{height}", "450")}
                      className={styles["thumbnail"]}
                      alt={userInfo.stream.user_name}
                    />
                    <div className={styles["viewers"]}>
                      {userInfo.stream.viewer_count} viewers
                    </div>
                  </div>
                </div>
              </a>
              <div>
                <div className={styles.streamerName}>
                  {userInfo.stream.user_name}
                </div>
                <div className={styles.streamGame}>
                  {
                    games.find((game) => game.id === userInfo.stream.game_id)
                      ?.name
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        Créé par{" "}
        <a
          rel="noreferrer noopener"
          href="https://www.twitter.com/Brecii"
          target="_blank"
          className={styles.logo}
        >
          Breci
        </a>
      </footer>
    </div>
  );
}

export async function getServerSideProps(context) {
  const streams = await getLiveStreams(getStreamers());
  streams.sort((a, b) => b.viewer_count - a.viewer_count);
  const usersIds = streams.map((stream) => stream.user_id);
  const gamesId = Array.from(new Set(streams.map((stream) => stream.game_id)));
  return {
    props: {
      streams: streams,
      users: await getUsersInfo(usersIds),
      games: await getGames(gamesId),
    }, // will be passed to the page component as props
  };
}
