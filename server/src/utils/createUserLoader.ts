import DataLoader from "dataloader";
import { User } from "../entities/User";

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const mapUserIdToUser: Record<number, User> = {};
    users.forEach((user) => {
      mapUserIdToUser[user.id] = user;
    });

    const sortedUsers = userIds.map((userId) => mapUserIdToUser[userId]);
    return sortedUsers;
  });
