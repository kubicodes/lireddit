import { MikroORM } from "@mikro-orm/core";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up(); //run migrations before doing anything else

  /** Code Example to Insert an entry using an entity
   ** const post = orm.em.create(Post, { title: "my first post" }); //doesn´t insert to db
   ** await orm.em.persistAndFlush(post);
   **/

  /** Code Example to fetch all entries for an entity
   ** const posts = await orm.em.find(Post, {});
   ** console.log(posts);
   **/
};

main().catch((error) => console.log(error));
console.error("Hello World");
