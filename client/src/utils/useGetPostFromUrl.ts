import { usePostQuery } from "../generated/graphql";
import { useGetIdAsInt } from "./useGetIdAsInt";

export const useGetPostFromUrl = () => {
  const intId = useGetIdAsInt();
  return usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
};
