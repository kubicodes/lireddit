import { useRouter } from "next/router";

export const useGetIdAsInt = () => {
  const router = useRouter();
  const idAsInt =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  return idAsInt;
};
