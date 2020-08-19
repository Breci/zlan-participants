import Head from "next/head";
import styles from "../styles/Home.module.scss";
import { getLiveStreams, getUsersInfo } from "../twitch";
import { getStreamers } from "../utils";
import { useMemo, useState } from "preact/hooks";
import Switch from "../ui/Switch";

const ZLAN_GAMES = [
  "512988", // AOE II
  "492553", // CIV VI
  "495764", // Golf it
  "512086", // heave ho
  "27471", // Minecraft
  "506458", // overcooked 2
  "493057", // PUBG
  "28605", // shootmania
  "493036", // worms
];

export default function Home({ streams, users }) {
  const usersInfo = useMemo(() => {
    return streams.map((stream) => {
      return {
        stream: stream,
        user: users.find((u) => u.id === stream.user_id),
      };
    });
  }, [streams, users]);

  const [filterByZLANGames, setFilterByZLANGames] = useState(false);

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
        <h1 className={styles.title}>ZLAN</h1>

        <div className={styles.listHeader}>
          <div className={styles.description}>Participants</div>
          <div className={styles.filter}>
            <span className={styles.filterText}>Jeux ZLAN</span>

            <Switch
              value={filterByZLANGames}
              onChange={(e) => {
                setFilterByZLANGames(e.target.checked);
              }}
            />
          </div>
        </div>

        <div className={styles.list}>
          {filteredUserInfo.map((userInfo) => (
            <a
              target="_blank"
              rel="noreferrer noopener"
              href={`https://www.twitch.tv/${userInfo.user.login}`}
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
                  <div className={styles["streamer-name"]}>
                    {userInfo.stream.user_name}
                  </div>
                </div>
              </div>
            </a>
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
  const usersIds = streams.map((stream) => stream.user_id);
  return {
    props: {
      streams: await getLiveStreams(getStreamers()),
      users: await getUsersInfo(usersIds),
    }, // will be passed to the page component as props
  };
}
