import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { v4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    return await em.findOne(User, { id: req.session.userId });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Username must be at least 3 characters long",
          },
        ],
      };
    }

    if (options.username.includes("@")) {
      return {
        errors: [
          {
            field: "username",
            message: "username cannot include @",
          },
        ],
      };
    }

    if (!options.email.includes("@")) {
      return {
        errors: [
          {
            field: "email",
            message: "invalid e-mail address",
          },
        ],
      };
    }

    if (options.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "Password must be at least 3 characters long",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const createdUser = em.create(User, {
      username: options.username,
      email: options.email,
      password: hashedPassword,
    });

    try {
      await em.persistAndFlush(createdUser);
    } catch (error) {
      console.log(error);
      if (error.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already exists",
            },
          ],
        };
      }
    }

    //store user id in session, set a cookie on the user and keep them logged in
    req.session.userId = createdUser.id;

    return { user: createdUser };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const matchedUser = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );

    if (!matchedUser) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "User with this username doesn´t exist",
          },
        ],
      };
    }

    const isPasswordValid = await argon2.verify(matchedUser.password, password);

    if (!isPasswordValid) {
      return {
        errors: [
          {
            field: "password",
            message: "Invalid password for this username",
          },
        ],
      };
    }

    req.session.userId = matchedUser.id;
    return { user: matchedUser };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<any> {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.error(err);
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ): Promise<boolean> {
    const matchedUser = await em.findOne(User, { email });

    if (!matchedUser) {
      //security just return true
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      matchedUser.id,
      "ex",
      1000 * 60 * 60 * 24 * 3 //3days
    );

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { em, redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const keyToMatchOnRedis = FORGET_PASSWORD_PREFIX + token;
    const matchedUserId = await redis.get(keyToMatchOnRedis);

    if (!matchedUserId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const matchedUser = await em.findOne(User, { id: parseInt(matchedUserId) });

    if (!matchedUser) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    matchedUser.password = await argon2.hash(newPassword);

    await em.persistAndFlush(matchedUser);
    await redis.del(keyToMatchOnRedis);
    //login after successfully changed password
    req.session.userId = matchedUser.id;

    return { user: matchedUser };
  }
}
