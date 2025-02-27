'use server'

import { currentUser, User } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma";

export const verifyAccesToWorkspace = async (workspaceId: string) => {
    try {
        const user = await currentUser();
        if (!user) {
            return { status: 403, message: "Unauthorized" };
        }
        const isUserInWorkspace = await client.workspace.findUnique({
            where: { 
                id: workspaceId, 
                OR: [
                    {
                        User: {
                            clerkid: user.id
                        }
                    },
                    {
                        members: {
                            every: {
                                User: {
                                    clerkid: user.id
                                }
                            }
                        }
                    }
                ]
        }
    }
);
        return { status: 200,
             data:{workspace: isUserInWorkspace},
             
            };
    } catch (error) { 
        return { 
            status: 403,
            data: { workspace: null }
        };
    }
}
export const getWorkspaceFolders = async (workspaceId: string) => {
    try {
        const isFolders = await client.folder.findMany({
            where: {
                workSpaceId: workspaceId
            },
            include: {
                _count: {
                    select: {
                        videos: true
                    }
                }
            }
        });
        
        if (isFolders.length>0 && !isFolders) {
            return { status:200, data: { folders: [] } };
        }
        
        return { status: 404, data: { folders: isFolders } };
    } catch (error) {
        return { status:403, data: { folders: [] } };
    }
}
export const getAllUserVideos = async (workSpaceId: string) => {
    try {
        const user = await currentUser();
        if (!user) {
            return { status: 403 };
        }
        
        const videos = await client.video.findMany({
            where: {
                OR: [
                    { workSpaceId: workSpaceId },
                    { folderId: workSpaceId }
                ]
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                source: true,
                processing: true,
                Folder: {
                    select: {   
                        id: true,
                        name: true
                    }
                },
                User: {
                    select: {
                        firstname: true,
                        lastname: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        
        if(videos.length>0 && videos) {
            return { status: 200, data: { videos } };
 } 
 return { status: 404 };
    } catch (error) {
        return { status: 400 };
    }
}

export const getWorkspaces = async () => {
    try {
        const user = await currentUser();
        if (!user) {
            return { status: 403 };
        }
        const workspaces = await client.user.findUnique({
            where: {
                clerkid: user.id
            },
            select: {
                subscription: {
                    select: {
                        plan: true
                    }
                },
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                member: {
                    select: {
                        workspace: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    }
                }
            }
        });
        if (workspaces) {
            return { 
                status: 200, 
                data: { workspaces: workspaces?.workspace || [] } 
            };
        }
       
    } catch (error) {
        return { status: 400, data: { workspaces: [] } };
    }
}

