import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
    if (!webhookSecret) {
      throw new Error(
        "Missing Clerk Webhook Secret. Please set CLERK_WEBHOOK_SECRET in your .env"
      );
    }

    // check headers

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Missing headers svix", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const webhook = new Webhook(webhookSecret);

    let evt: any;

    //verifying the webhook

    try {
      evt = webhook.verify(body, {
        "svix-id": svix_id,
        "svix-signature": svix_signature,
        "svix-timestamp": svix_timestamp,
      });
    } catch (error) {
      console.error("Error verifying webhook", error);
      return new Response("Error verifying webhook", { status: 400 });
    }
    // yahan tk saari verification ho chuki hai

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name} ${last_name}`;

      try {
        await ctx.runMutation(api.users.createUser, {
          username: email.split("@")[0],
          fullName: name,
          image: image_url,
          email: email,
          clerkId: id,
        });
      } catch (error) {
        console.error("Error creating user", error);
        return new Response("Error creating user", { status: 400 });
      }
    }

    return new Response("Webhook process successfully", { status: 200 });
  }),
});

export default http;
