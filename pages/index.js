import Head from 'next/head'
import styles from '../styles/Home.module.scss'
import {getLiveStreams} from "../twitch";
import {getStreamers} from "../utils";

export default function Home({streams}) {
  return (
    <div className={styles.container}>
      <Head>
        <title>ZLAN</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          ZLAN
        </h1>

        <p className={styles.description}>
          Découvrez les participants
        </p>

         <div className={styles.list}>
             {streams.map(stream=>(      <div className={styles["anim-container"]} style="position: relative">
                 <div className={styles["top-left-corner"]}></div>
                 <div className={styles["left-side"]}></div>
                 <div className={styles["bottom-side"]}></div>
                 <div className={styles["bottom-right-corner"]}></div>
                 <div className={styles["img-container"]}>
                     <img
                     src={stream.thumbnail_url.replace("{width}","800").replace("{height}","450")}
                      className={styles["thumbnail"]}
                     alt={stream.user_name}
                 />
                 <div className={styles["viewers"]}>{ stream.viewer_count } viewers</div>
                 <div className={styles["streamer-name"]}>{ stream.user_name }</div>
             </div>
                 </div>
                 ))}
         </div>
      </main>

      <footer className={styles.footer}>
          Créé par{' '}
          <a href="https://www.twitter.com/Brecii" target="_blank" className={styles.logo} >Breci</a>
      </footer>
    </div>
  )
}

export async function getServerSideProps(context) {
  return {
    props: {
      streams: await getLiveStreams(getStreamers())
    }, // will be passed to the page component as props
  }
}
