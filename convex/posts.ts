import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },

  handler: async (ctx, args) => {
    // create a post in db

    const currentUser = await getAuthenticatedUser(ctx);
    const imageUrl = await ctx.storage.getUrl(args.storageId);

    if (!imageUrl) {
      throw new Error("Image not found");
    }

    // create post

    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl: imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });

    // increment the user's post by 1

    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});

export const getFeedPosts = query({
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // get all posts
    const posts = await ctx.db.query("posts").order("desc").collect();

    if (posts.length == 0) return [];

    //enhance the posts with user info and interaction
    const postsWithInfo = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = (await ctx.db.get(post.userId))!;
        const isLiked = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) => {
            return q.eq("userId", currentUser._id).eq("postId", post._id);
          })
          .first();

        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) => {
            return q.eq("userId", currentUser._id).eq("postId", post._id);
          })
          .first();

        return {
          ...post,
          author: {
            id: postAuthor?._id,
            username: postAuthor?.username,
            image: postAuthor?.image,
          },
          isLiked: !!isLiked,
          isBookmarked: !!bookmark,
        };
      })
    );

    return postsWithInfo;
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // finding the current status of that like
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      // unlike
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, { likes: post.likes - 1 });
      return false; // unliked
    } else {
      // like
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, { likes: post.likes + 1 });

      await ctx.db.patch(args.postId, { likes: post.likes + 1 });

      // If it's not my post => create a notification
      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          postId: args.postId,
          receiverId: post.userId,
          senderId: currentUser._id,
          type: "like",
        });
      }

      return true; // liked
    }
  },
});

// delete post, and bookmarks and all comments associated with it
export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (post.userId !== currentUser._id) {
      throw new Error("Unauthorized");
    }

    // delete all likes
    await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect()
      .then((likes) => {
        likes.forEach((like) => {
          ctx.db.delete(like._id);
        });
      });

    // delete all bookmarks
    await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect()
      .then((bookmarks) => {
        bookmarks.forEach((bookmark) => {
          ctx.db.delete(bookmark._id);
        });
      });

    // delete all comments
    await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect()
      .then((comments) => {
        comments.forEach((comment) => {
          ctx.db.delete(comment._id);
        });
      });

    // delete notifcation
    await ctx.db
      .query("notifications")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect()
      .then((notifications) => {
        notifications.forEach((notification) => {
          ctx.db.delete(notification._id);
        });
      });

    //delete image too
    await ctx.storage.delete(post.storageId);
    // delete the post
    await ctx.db.delete(args.postId);
    // decrement the user's post count
    await ctx.db.patch(currentUser._id, {
      posts: Math.max(currentUser.posts - 1, 0),
    });
  },
});
