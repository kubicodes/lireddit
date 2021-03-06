import React from "react";
import { useRouter } from "next/router";
import { useCreatePostMutationMutation } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/isAuth";
import { InputField } from "../components/InputField";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/react";
import { Layout } from "../components/Layout";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  useIsAuth();
  const [, createPost] = useCreatePostMutationMutation();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { error } = await createPost({ input: values });
          if (!error) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="text..."
                label="Body"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              create post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
