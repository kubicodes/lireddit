import { IconButton } from "@chakra-ui/button";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Link } from "@chakra-ui/layout";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";
import NextLink from "next/link";
import router from "next/router";

interface EditAndDeletePostButtonsProps {
  postId: number;
  creatorId: number;
}

export const EditAndDeletePostButtons: React.FC<EditAndDeletePostButtonsProps> =
  ({ postId, creatorId }) => {
    const [{ data: meData }] = useMeQuery();
    const [, deletePost] = useDeletePostMutation();

    if (meData?.me?.id !== creatorId) {
      return null;
    }

    return (
      <Box maxW="100">
        <NextLink href="/post/edit/[id]" as={`/post/edit/${postId}`}>
          <IconButton
            as={Link}
            mr={4}
            icon={<EditIcon />}
            aria-label="Edit Post"
          />
        </NextLink>
        <IconButton
          icon={<DeleteIcon />}
          aria-label="Delete Post"
          onClick={() => {
            deletePost({ id: postId });
            router.push("/");
          }}
        />
      </Box>
    );
  };
