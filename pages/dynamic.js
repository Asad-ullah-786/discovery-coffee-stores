import { useRouter } from "next/router";

const DynamicRoute =() => {
    const router = useRouter();
    const query = router.query.id;
  return (
    <div><head><title>{query}</title></head>Hi there I am a dynamic route {query}</div>
  );
}   
export default DynamicRoute;