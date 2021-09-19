import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    try {
      const hashedPassword = await argon2.hash(options.password);
      const createdUser = em.create(User, {
        username: options.username,
        password: hashedPassword,
      });
      await em.persistAndFlush(createdUser);

      return createdUser;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
