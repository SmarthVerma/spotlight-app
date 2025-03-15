import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

export const addComment = mutation({
  args: {
    content: v.string(),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const commentId = await ctx.db.insert("comments", {
      userId: currentUser._id,
      postId: args.postId,
      content: args.content,
    });

    // increment comment count by 1
    await ctx.db.patch(args.postId, {
      comments: post.comments + 1,
    });

    if (post.userId !== currentUser._id) {
      // notify the post owner
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId: currentUser._id,
        type: "comment",
        commentId: commentId,
        postId: args.postId,
      });
    }
  },
});

export const getComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    const commentsWithInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = (await ctx.db.get(comment.userId))!;
        return {
          ...comment,
          user: {
            fullname: user.fullName,
            image: user.image,
          },
        };
      })
    );

    console.log('the commensWithInfo', commentsWithInfo)
    return commentsWithInfo;
  },
});
