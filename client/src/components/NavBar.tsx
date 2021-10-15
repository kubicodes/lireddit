import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { isServer } from "../utils/isServer";

export const NavBar: React.FC<{}> = () => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(), //stop execution on SSR
  });
  const [_, logout] = useLogoutMutation();
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
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            create post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button variant="link" onClick={() => logout()}>
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
