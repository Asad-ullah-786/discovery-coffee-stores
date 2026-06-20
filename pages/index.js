import Head from "next/head";
import styles from "../styles/Home.module.css";
import Banner from "@/components/banner";
import Image from "next/image";
import Card from "@/components/card";
import { fetchCoffeeStores } from "@/lib/coffee-stores";
import useTrackLocation from "@/hooks/use-track-location";
import { useEffect, useState, useRef, useContext } from "react";
import { StoreContext, ACTION_TYPES } from "@/store/store-context";

export async function getStaticProps(context) {
  const CoffeeStore = await fetchCoffeeStores();
  return {
    props: {
      CoffeeStore,
    },
  };
}

export default function Home(props) {
  console.log("props", props);

  const { state, dispatch } = useContext(StoreContext);
  const { handleTrackLocation, latLong, locationErrorMsg, isFindingLocation } =
    useTrackLocation();

  const [coffeeStores, setCoffeeStores] = useState([]);
  const [coffeStoresError, setError] = useState(null);
  const [hasViewedNearby, setHasViewedNearby] = useState(false);
  const initialRender = useRef(true);

  console.log({ latLong, locationErrorMsg });

  // Context se previously saved stores load karo
  useEffect(() => {
    if (state.coffeeStores && state.coffeeStores.length > 0) {
      setCoffeeStores(state.coffeeStores);
      setHasViewedNearby(true);
    }
  }, []);

  useEffect(() => {
    const setCoffeeStoresByLocation = async () => {
      if (latLong && initialRender.current) {
        initialRender.current = false;
        try {
          const response = await fetch(`/api/getCoffeeStoresByLocation?latLong=${latLong}&limit=30`);
          const coffeeStores = await response.json();
          setCoffeeStores(coffeeStores);
          setHasViewedNearby(true);
          
          // Context mein bhi save karo taake back aane par available ho
          dispatch({
            type: ACTION_TYPES.SET_COFFEE_STORES,
            payload: { coffeeStores },  
          });   
        } catch (error) {
          setError(error.message);
          console.log("Error fetching coffee stores", error);
        }
      }
    };

    setCoffeeStoresByLocation();
  }, [latLong, dispatch]);

  const handleOnBannerBtnClick = () => {
    console.log("hi banner button");
    handleTrackLocation();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Coffee Connoisseur</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* SECTION 1: Sirf Hero (Text aur Image amne-samne) */}
      <main className={styles.main}>
        <div className={styles.heroText}>
          <Banner
            buttonText={isFindingLocation ? "Loading..." : "View stores nearby"}
            handleOnClick={handleOnBannerBtnClick}
          />
          {locationErrorMsg && <p>Something went wrong: {locationErrorMsg}</p>}
          {coffeStoresError && <p>Something went wrong: {coffeStoresError}</p>}
        </div>

        <div className={styles.heroImage}>
          <Image
            src="/static/hero-image.png"
            width={700}
            height={400}
            alt="hero image"
            priority
          />
        </div>
      </main>
      {/* FIX: Context se bhi data check karo */}
      {(coffeeStores.length > 0 || hasViewedNearby || (state.coffeeStores && state.coffeeStores.length > 0)) && (
        <div className={styles.sectionWrapper}>
          <h2 className={styles.heading2}>Stores near me</h2>
          <div className={styles.cardLayout}>
            {(coffeeStores.length > 0 ? coffeeStores : state.coffeeStores || []).map((Coffeestore) => (
                <Card
                  key={Coffeestore.id}
                  name={Coffeestore.name}
                  imgUrl={
                    Coffeestore.imgUrl ||
                    "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                  }
                  href={`/coffee-store/${Coffeestore.id}`}
                />
              ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Coffee Stores (Ye neechay aayega kyunke ye 'main' se bahar hai) */}
      {props.CoffeeStore.length > 0 && (
        <>
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Toronto Stores</h2>
            <div className={styles.cardLayout}>
              {props.CoffeeStore.map((Coffeestore) => (
                <Card
                  key={Coffeestore.id}
                  name={Coffeestore.name}
                  imgUrl={
                    Coffeestore.imgUrl ||
                    "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                  }
                  href={`/coffee-store/${Coffeestore.id}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
