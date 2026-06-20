import Head from "next/head";
import styles from "../styles/Home.module.css";
import Banner from "@/components/banner";
import Image from "next/image";
import Card from "@/components/card";
import { fetchCoffeeStores } from "@/lib/coffee-stores";
import staticCoffeeStores from "@/data/coffee-stores.json";
import useTrackLocation from "@/hooks/use-track-location";
import { useEffect, useState, useRef, useContext } from "react";
import { StoreContext, ACTION_TYPES } from "@/store/store-context";

export async function getStaticProps(context) {
  let CoffeeStore = [];

  try {
    CoffeeStore = await fetchCoffeeStores();
  } catch (error) {
    console.error("Error fetching coffee stores for static props:", error);
  }

  if (!Array.isArray(CoffeeStore) || CoffeeStore.length === 0) {
    CoffeeStore = staticCoffeeStores;
  }

  return {
    props: {
      CoffeeStore,
    },
  };
}

export default function Home(props = {}) {
  console.log("props", props);

  const { state, dispatch } = useContext(StoreContext);
  const { handleTrackLocation, latLong, locationErrorMsg, isFindingLocation } =
    useTrackLocation();

  const [coffeeStores, setCoffeeStores] = useState([]);
  const [coffeeStoresError, setError] = useState(null);
  const [hasViewedNearby, setHasViewedNearby] = useState(false);
  const initialRender = useRef(true);

  const coffeeStoreProps = Array.isArray(props.CoffeeStore) && props.CoffeeStore.length > 0 ? props.CoffeeStore : staticCoffeeStores;
  const cachedCoffeeStores = Array.isArray(state.coffeeStores) ? state.coffeeStores : [];
  const nearbyCoffeeStores = Array.isArray(coffeeStores) ? coffeeStores : [];
  const displayCoffeeStores = nearbyCoffeeStores.length > 0 ? nearbyCoffeeStores : cachedCoffeeStores;
  const showNearbyStores = displayCoffeeStores.length > 0 || hasViewedNearby;

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
          const response = await fetch(`/api/getCoffeeStoresByLocation?latLong=${encodeURIComponent(latLong)}&limit=30`);

          if (!response.ok) {
            throw new Error(`Failed to fetch nearby stores (${response.status})`);
          }

          const coffeeStores = await response.json();

          if (!Array.isArray(coffeeStores)) {
            throw new Error("Unexpected response format from coffee store API");
          }

          setCoffeeStores(coffeeStores);
          setHasViewedNearby(true);

          // Context mein bhi save karo taake back aane par available ho
          dispatch({
            type: ACTION_TYPES.SET_COFFEE_STORES,
            payload: { coffeeStores },
          });
        } catch (error) {
          setCoffeeStores([]);
          setError(error?.message || "Unable to load nearby stores");
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
          {coffeeStoresError && <p>Something went wrong: {coffeeStoresError}</p>}
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
      {showNearbyStores && (
        <div className={styles.sectionWrapper}>
          <h2 className={styles.heading2}>Stores near me</h2>
          <div className={styles.cardLayout}>
            {displayCoffeeStores.map((Coffeestore) => (
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
      {coffeeStoreProps.length > 0 && (
        <>
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Toronto Stores</h2>
            <div className={styles.cardLayout}>
              {coffeeStoreProps.map((Coffeestore) => (
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
