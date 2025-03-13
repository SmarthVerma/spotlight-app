import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    username: v.string(),
    fullName: v.string(),
    image: v.string(),
    bio: v.optional(v.string()),
    email: v.string(),
    clerkId: v.string(),
  },

  handler: async (ctx, args) => {
    // create a user in db

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    console.log("BEfore existing");
    if (existingUser) return;

    console.log("this should not go beyond", existingUser);
    await ctx.db.insert("users", {
      username: args.username,
      fullName: args.fullName,
      image: args.image,
      bio: args.bio,
      email: args.email,
      clerkId: args.clerkId,
      followers: 0,
      following: 0,
      posts: 0,
    });
  },
});
