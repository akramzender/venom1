"use server";

import { client } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET as string, 
  // Use the latest Stripe API version
);
// Helper to send email
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.MAILER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.MAILER_EMAIL,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return { success: true };
  } catch (error: any) {
    console.error("⛔ Email error:", error.message);
    return { success: false, error: error.message };
  }
};

// Authenticate user
export const onAuthenticateUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { status: 403, message: "Unauthorized" };
    }

    const userExists = await client.user.findUnique({
      where: { clerkid: user.id },
      include: {
        workspace: {
          where: { User: { clerkid: user.id } },
        },
      },
    });

    if (userExists) return { status: 200, user: userExists };

    const newUser = await client.user.create({
      data: {
        clerkid: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstname: user.firstName,
        lastname: user.lastName,
        image: user.imageUrl,
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

    if (newUser) return { status: 200, user: newUser };

    return { status: 400, message: "Failed to create user" };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Internal server error" };
  }
};

// Get Notifications
export const getNotifications = async () => {
  try {
    const user = await currentUser();
    if (!user) return { status: 403 };

    const notifications = await client.user.findUnique({
      where: { clerkid: user.id },
      select: {
        notification: {
          select: {
            id: true,
            userId: true,
            content: true,
          },
        },
        _count: {
          select: { notification: true },
        },
      },
    });

    if (notifications) {
      const notificationCount = notifications._count?.notification ?? 0;
      return {
        status: 200,
        data: {
          notification: notifications.notification,
          _count: { notification: notificationCount },
        },
      };
    }

    return { status: 400, data: { notification: [], _count: { notification: 0 } } };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Internal server error", data: { notification: [], _count: { notification: 0 } } };
  }
};

// Search Users
export const searchUsers = async (query: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404 };

    const users = await client.user.findMany({
      where: {
        OR: [
          { firstname: { contains: query } },
          { email: { contains: query } },
          { lastname: { contains: query } },
        ],
        NOT: [{ clerkid: user.id }],
      },
      select: {
        id: true,
        subscription: { select: { plan: true } },
        firstname: true,
        lastname: true,
        image: true,
        email: true,
      },
    });

    if (users.length > 0) return { status: 200, data: users };
    return { status: 404, data: undefined };
  } catch (error) {
    console.error(error);
    return { status: 400, data: undefined };
  }
};

// Get Payment Info
export const getPaymentInfo = async () => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404 };

    const payment = await client.user.findUnique({
      where: { clerkid: user.id },
      select: { subscription: { select: { plan: true } } },
    });

    if (payment) return { status: 200, data: payment };
    return { status: 404 };
  } catch (error) {
    console.error(error);
    return { status: 400 };
  }
};

// Get First View
export const getFirstView = async () => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404 };

    const userData = await client.user.findUnique({
      where: { clerkid: user.id },
      select: { firstView: true },
    });

    if (userData) return { status: 200, data: userData.firstView };
    return { status: 400, data: false };
  } catch (error) {
    console.error(error);
    return { status: 400 };
  }
};

// Enable First View
export const enableFirstView = async (state: boolean) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404 };

    const view = await client.user.update({
      where: { clerkid: user.id },
      data: { firstView: state },
    });

    if (view) return { status: 200, data: "Settings updated!" };
  } catch (error) {
    console.error(error);
    return { status: 400 };
  }
};

// Create Comment or Reply
export const createCommentAndReply = async (userId: string, comment: string, videoId: string, commentId?: string) => {
  try {
    if (commentId) {
      const reply = await client.comment.update({
        where: { id: commentId },
        data: {
          reply: { create: { comment, userId, videoId } },
        },
      });

      if (reply) return { status: 200, data: "Reply posted" };
    }

    const newComment = await client.video.update({
      where: { id: videoId },
      data: {
        comment: { create: { comment, userId } },
      },
    });

    if (newComment) return { status: 200, data: "New Comment added!" };
    return { status: 500, data: "Failed to create comment or reply" };
  } catch (error) {
    console.error("Error in createCommentAndReply:", error);
    return { status: 400, data: "Something went wrong" };
  }
};

// Get User Profile
export const getUserProfile = async () => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404, data: null };

    const profile = await client.user.findUnique({
      where: { clerkid: user.id },
      select: { image: true, id: true },
    });

    if (profile) return { status: 200, data: profile };
    return { status: 404, data: null };
  } catch (error) {
    console.error(error);
    return { status: 400, data: null };
  }
};

// Get Video Comments
export const getVideoComments = async (id: string) => {
  try {
    const comments = await client.comment.findMany({
      where: {
        OR: [{ videoId: id }, { commentId: id }],
        commentId: null,
      },
      include: {
        reply: { include: { User: true } },
        User: true,
      },
    });

    if (comments.length > 0) return { status: 200, data: comments };
    return { status: 404 };
  } catch (error) {
    console.error(error);
    return { status: 400 };
  }
};

// Invite Members
export const inviteMembers = async (workspaceId: string, receiverId: string, email: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404, data: "User not found" };

    const senderInfo = await client.user.findUnique({
      where: { clerkid: user.id },
      select: { id: true, firstname: true, lastname: true },
    });

    const receiverInfo = await client.user.findUnique({
      where: { id: receiverId },
      select: { firstname: true, lastname: true },
    });

    const workspace = await client.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    if (!senderInfo || !workspace || !receiverInfo) {
      return { status: 404, data: "Missing data" };
    }

    const invitation = await client.invite.create({
      data: {
        senderId: senderInfo.id,
        receiverId,
        workSpaceId: workspaceId,
        content: `You are invited to join ${workspace.name} Workspace, click accept to confirm.`,
      },
      select: { id: true },
    });

    await client.user.update({
      where: { clerkid: user.id },
      data: {
        notification: {
          create: {
            content: `${senderInfo.firstname ?? ""} ${senderInfo.lastname ?? ""} invited ${receiverInfo.firstname ?? ""} ${receiverInfo.lastname ?? ""} into ${workspace.name}`,
          },
        },
      },
    });

    const emailResult = await sendEmail(
      email,
      "You got an invitation 🚀",
      
      `You are invited to join ${workspace.name} Workspace, click accept to confirm.`,
              `<body style="margin:0;padding:0;width:100%;height:100%;font-family:Arial,sans-serif;background-color:#121212;color:#ffffff;">
  <div style="max-width:600px;margin:0 auto;background-color:#1e1e1e;border-radius:8px;overflow:hidden;box-shadow:0 4px 8px rgba(0,0,0,0.3);">
    
    <!-- Header -->
    <div style="background-color:#00a87e;padding:20px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#ffffff;">You're Invited!</h1>
    </div>

    <!-- Body -->
    <div style="padding:20px;text-align:center;">
      <p style="margin:0 0 20px;line-height:1.6;">Hi,</p>
      <p style="margin:0 0 20px;line-height:1.6;">You have been invited to join the <strong>Odix Workspace</strong>. Click the button below to accept your invitation and get started.</p>
      <a href="${process.env.NEXT_PUBLIC_HOST_URL}/invite/${invitation.id}" 
         style="display:inline-block;padding:12px 20px;background-color:#00a87e;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;border-radius:6px;margin-top:20px;">
         Accept Invite
      </a>
    </div>

    <!-- Footer -->
    <div style="margin-top:20px;padding:10px;text-align:center;background-color:#1e1e1e;font-size:12px;color:#7d7d7d;">
      <p>&copy; 2025 Odix. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
               `
    );

    if (!emailResult.success) {
      return { status: 400, data: "Failed to send email" };
    }

    return { status: 200, data: "Invite sent" };
  } catch (error) {
    console.error(error);
    return { status: 500, data: "Something went wrong" };
  }
};

// Accept Invitation
export const acceptInvite = async (inviteId: string) => {
  try {
    const user = await currentUser();
    if (!user) return { status: 404, message: "User not found" };

    const invitation = await client.invite.findUnique({
      where: { id: inviteId },
      include: {
        receiver: { select: { clerkid: true, id: true } },
        Workspace: true,
      },
    });

    if (!invitation) return { status: 404, message: "Invitation not found" };

    if (user.id !== invitation.receiver?.clerkid) {
      return { status: 401, message: "Not authorized to accept this invitation" };
    }

    await client.invite.update({
      where: { id: inviteId },
      data: { accepted: true },
    });

    await client.member.create({
      data: {
        userId: invitation.receiver.id,
        workspaceId: invitation.workSpaceId,
        member: true,
      },
    });

    await client.notification.create({
      data: {
        userId: invitation.senderId,
        content: `${user.firstName ?? ""} ${user.lastName ?? ""} has accepted your invitation to join ${invitation.Workspace?.name}`,
      },
    });

    return { status: 200, message: "Invitation accepted successfully" };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Something went wrong" };
  }
};


export const completeSubscription = async (session_id : string)=> {
  try{
    const user = await currentUser();
    if (!user) return { status: 404, data: "User not found" };
    const session = await stripe.checkout.sessions.retrieve(session_id)
    if(session){
      const custumer = await client.user.update({
        where : {
          clerkid : user.id,
        },
        data : {
          subscription : {
            update : {
              data :{
                customerId : session.customer as string,
                plan : 'PRO'
              }
            }
          }
        }
      })
      if(custumer) {
        return {status : 200}
      }
      
    }
    return {status : 404}
  }catch(error){
    return {status : 400 }
  } }