"use server";

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";

export const onAuthenticateUser = async () => {
  try {
    const user = await currentUser();

    // Validate user existence
    if (!user) {
      return { status: 403, message: "Unauthorized" };
    }

    // Check if the user already exists in the database
    const userExists = await client.user.findUnique({
      where: { clerkid: user.id },
      include: {
        workspace: {
          where: { User: { clerkid: user.id } },
        },
      },
    });

    // Return the existing user if found
    if (userExists) {
      return { status: 200, user: userExists };
    }

    // Create a new user in the database
    const newUser = await client.user.create({
      data: {
        clerkid: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "unknown@example.com", // Fallback for email
        firstname: user.firstName ?? "Unknown",
        lastname: user.lastName ?? "User",
        image: user.imageUrl ?? "",
        studio: { create: {} },
        subscription: { create: {} },
        workspace: {
          create: {
            name: `${user.firstName ?? "User"}'s Workspace`,
            type: "PERSONAL",
          },
        },
      },
      include: {
        workspace: {
          where: { User: { clerkid: user.id } },
        },
        subscription: {
          select: { plan: true },
        },
      },
    });

    // Return the newly created user
    if (newUser) {
      return { status: 200, user: newUser };
    }

    // Handle failure to create a user
    return { status: 400, message: "Failed to create user" };
  } catch (error) {
    console.error("⛔ Error in onAuthenticateUser:", error);

    // Return a generic error response
    return { status: 500, message: "Internal server error" };
  }
};