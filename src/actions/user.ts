"use server";

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const onAuthenticateUser = async () => {
    try {
        const user = await currentUser();
        if (!user) {
            return { status: 403, message: "Unauthorized" };
        }
        const userExists = await client.user.findUnique({
            where: {
                clerkid: user.id,
            },
            include: {
                workspace: {
                    where: {
                        User: {
                            clerkid: user.id,
                        }
                    }
                }
            }
        })
        if (userExists) {
            return { status: 200, user: userExists };
        }
        const newUser = await client.user.create({
            data: {
                clerkid: user.id,
                email: user.emailAddresses[0].emailAddress,
                firstname: user.firstName,
                lastname: user.lastName,
                image: user.imageUrl,
                studio :{
                    create: {},
                },
                subscription: {
                    create: {},
                },
                workspace: {
                    create: {
                        name: `${user.firstName}'s Workspace`,
                        type: "PERSONAL",
                    },
                },
            },
            include: {
                workspace: {
                    where:{
                        User:{
                            clerkid: user.id,
                        }
                    }
                },
                subscription:{
                    select:{
                        plan: true,
                    }
                }
            }
        })
        if (newUser) {
            return { status: 200, user: newUser };
        }
        return { status: 400, message: "Failed to create user" };
    } catch (error) {
        return { status: 500, message: "Internal server error" };
    }
}
export const getNotifications = async () => {
    try {
        const user = await currentUser();
        if (!user) {
            return { status: 403, message: "Unauthorized" };
        }
        const notifications = await client.user.findUnique({
            where: {
                clerkid: user.id,
            },
            select:{
                notification: true,
                _count:{
                    select:{
                        notification: true,
                    }
                }
            }
            
        });
        if (notifications && notifications.notification.length > 0) {
            return { status: 200, data: { notifications } };
        }
        return { status: 404, message: "Failed to get notifications" };
    } catch (error) {
        return { status: 400, message: "Internal server error" };
    }
}