import React from "react";
import { Wrapper } from "../components/Wrapper";
import { Form, Formik } from "formik";
import { InputField } from "../components/InputField";
import { Box, Button } from "@chakra-ui/react";
import { useLoginMutation, useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Login: React.FC<{}> = () => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { data } = await login(values);
          if (data?.login.errors) {
            setErrors(toErrorMap(data.login.errors));
          }
          if (data?.login.user) {
            await router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label="Username or Email"
              placeholder="username or email"
              name="usernameOrEmail"
            />
            <Box mt={4}>
              <InputField
                label="Password"
                type="password"
                placeholder="password"
                name="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
