import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";

export const NavBar: React.FC<{}> = () => {
  const [{ data }] = useMeQuery();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  let body = null;
  if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button variant="link" onClick={() => logout()}>
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="tan" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
