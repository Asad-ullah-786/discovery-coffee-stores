import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import styles from "../../styles/coffee-store.module.css";
import Image from "next/image";
import cls from "classnames";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "@/store/store-context";
import { fetchCoffeeStores } from "@/lib/coffee-stores";
import staticCoffeeStores from "@/data/coffee-stores.json";
import useSWR, { mutate as globalMutate } from "swr";

export async function getStaticProps(staticProps) {
  const params = staticProps.params;

  // Pehle static stores mein check karo
  let findCoffeeStoreById = staticCoffeeStores.find((coffeeStore) => {
    return coffeeStore.id.toString() === params.id;
  });

  // Agar static mein na mile toh Foursquare se fetch karo
  if (!findCoffeeStoreById) {
    try {
      const coffeeStores = await fetchCoffeeStores();
      const nearbyStores = await fetchCoffeeStores(
        "43.734408615313974, -79.35777890925395",
        30,
      );

      const allStores = [...coffeeStores, ...nearbyStores];
      findCoffeeStoreById = allStores.find((coffeeStore) => {
        return coffeeStore.id.toString() === params.id;
      });
    } catch (error) {
     
    }
  }

  return {
    props: {
      coffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {},
    },
    revalidate: 10,
  };
}

export async function getStaticPaths() {
  // Static stores ko include karo
  let allStores = [...staticCoffeeStores];

  // Agar API working hai toh dynamic stores bhi add karo
  try {
    const coffeeStores = await fetchCoffeeStores();
    const nearbyStores = await fetchCoffeeStores(
      "43.734408615313974, -79.35777890925395",
      30,
    );
    allStores = [...allStores, ...coffeeStores, ...nearbyStores];
  } catch (error) {
   
    // Sirf static stores use karo agar API fail ho
  }

  // Duplicate IDs hatao
  const uniqueStores = allStores.filter(
    (store, index, self) => index === self.findIndex((s) => s.id === store.id),
  );

  const paths = uniqueStores.map((coffeeStore) => {
    return {
      params: { id: coffeeStore.id.toString() },
    };
  });

  return {
    paths,
    fallback: true,
  };
}

const CoffeeStore = (props) => {
  const router = useRouter();
  const { state } = useContext(StoreContext);
  const id = router.query.id;
  const [coffeeStore, setCoffeeStore] = useState(props.coffeeStore);

  const handleCreateCoffeeStore = async (coffeeStore) => {
    if (!coffeeStore || !coffeeStore.id) {
      return;
    }

    try {
    

      const { id, name, voting, imgUrl, neighborhood, neighbourhood, address } =
        coffeeStore;
      const safeNeighborhood = neighborhood || neighbourhood || "";

      console.log("Extracted Data:", {
        id,
        name,
        voting,
        imgUrl,
        neighborhood: safeNeighborhood,
        address,
      });

      const response = await fetch("/api/createCoffeeStore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          voting,
          imgUrl,
          neighbourhood: safeNeighborhood,
          address: address || "",
        }),
      });
      const dbCoffeeStore = await response.json();
     
    } catch (error) {
      console.error("Error creating coffee store:", error);
    }
  };

  // Client-side: Check context stores pehle
  useEffect(() => {
    if (!router.query.id) {
      return;
    }

    const coffeeStoreFromContext =
      state.coffeeStores?.find((s) => s.id.toString() === router.query.id) ||
      null;

    if (coffeeStoreFromContext) {
      setCoffeeStore(coffeeStoreFromContext);
      handleCreateCoffeeStore(coffeeStoreFromContext);
      return;
    }

    if (coffeeStore?.id) {
      handleCreateCoffeeStore(coffeeStore);
    }
  }, [coffeeStore, router.query.id, state.coffeeStores]);

  const { address, name, neighborhood, neighbourhood, imgUrl } =
    coffeeStore || {};
  const storeNeighborhood = neighborhood || neighbourhood || "";

  const [votingCount, setVotingCount] = useState(0);

  const fetcher = (url) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR(
    id ? `/api/getCoffeeStoreById?id=${id}` : null,
    fetcher,
  );

  useEffect(() => {
   
    if (data) {
      if (Array.isArray(data) && data.length > 0) {
        console.log("Data from SWR:", data);
        setCoffeeStore(data[0]);
        setVotingCount(data[0].voting || 0);
      } else if (data.message) {
        console.log("SWR message:", data.message);
      } else {
        console.log("SWR returned non-array:", data);
        setVotingCount(data.voting || 0);
      }
    }
  }, [id, data, error]);

  // Listen for updates from other tabs and revalidate SWR when a vote occurs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "coffee-store-updated") {
        try {
          const payload = JSON.parse(e.newValue);
          if (
            payload &&
            payload.id &&
            id &&
            payload.id.toString() === id.toString()
          ) {
            globalMutate(`/api/getCoffeeStoreById?id=${id}`);
          }
        } catch (err) {
          console.error("Error parsing storage event payload:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [id]);

  const handleUpvoteButton = async () => {
   
    try {
      const response = await fetch("/api/favouriteCoffeeStorebyId", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });
      const dbCoffeeStore = await response.json();

      if (dbCoffeeStore && dbCoffeeStore.length > 0) {
        const updatedVoting = dbCoffeeStore[0].voting || votingCount + 1;
        setVotingCount(updatedVoting);


        // Revalidate SWR cache for this store in this tab
        globalMutate(`/api/getCoffeeStoreById?id=${id}`);

        // Broadcast to other tabs so they can revalidate
        try {
          localStorage.setItem(
            "coffee-store-updated",
            JSON.stringify({ id: id, updatedAt: Date.now() }),
          );
        } catch (err) {
          console.error("Error writing to localStorage:", err);
        }
      }
    } catch (error) {
      console.error("Error upvoting coffee store:", error);
    }
  };

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Something went wrong retrieving coffee store data. </div>;
  }

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name || "Coffee Store"}</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href="/">← Back to home</Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name || "Coffee Store"}</h1>
          </div>

          <div className={styles.storeImgWrapper}>
            <Image
              src={
                imgUrl ||
                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              }
              fill
              className={styles.storeImg}
              alt={name || "coffee store image"}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 700px"
            />
          </div>
        </div>

        <div className={styles.col2}>
          <div className={styles.iconWrapper}>
            <Image
              src="/static/icons/location_on_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png"
              width="24"
              height="24"
              alt="location icon"
            />
            <p className={styles.text}>{address || "Address not available"}</p>
          </div>

          {storeNeighborhood && (
            <div className={styles.iconWrapper}>
              <Image
                src="/static/icons/near_me_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png"
                width="24"
                height="24"
                alt="neighborhood icon"
              />
              <p className={styles.text}>{storeNeighborhood}</p>
            </div>
          )}

          <div className={styles.iconWrapper}>
            <Image
              src="/static/icons/star_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png"
              width="24"
              height="24"
              alt="star icon"
            />
            <p className={styles.text}> {votingCount} reviews</p>
          </div>

          <button className={styles.upvoteButton} onClick={handleUpvoteButton}>
            👍 Upvote this store!
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeStore;
