import Link from "next/link";
import Image from "next/image"; 
import styles from "./card.module.css"   
const Card = (props) => {
  return (
    <div className={styles.container}>
      <Link className={styles.cardlink} href={props.href}>
        <div className={styles.cardHeaderWrapper}>
          <h2 className={styles.cardHeader}>{props.name}</h2>
          </div>
          <div className={styles.cardImageWrapper}>
          <Image className={styles.cardImage} src={props.imgUrl} width={260} height={200} alt={props.name} />
            </div>
      </Link>
    </div>
  );
};
export default Card;
