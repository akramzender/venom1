import React from "react";
import { redirect } from "next/navigation";
import { getNotifications, onAuthenticateUser } from "@/actions/user";
import { getAllUserVideos, getWorkspaceFolders, getWorkspaces, verifyAccesToWorkspace } from "@/actions/workspace";
import { dehydrate, HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "@/components/global/sidebar";

type Props = {
    params: {
        workspaceId: string;
    };
    children: React.ReactNode;
}

const Layout = async ({ params: { workspaceId }, children }: Props) => {
    const auth = await onAuthenticateUser();
    if (!auth.user?.workspace) return redirect('/auth/sign-in');
    if (!auth.user.workspace.length) return redirect('/auth/sign-in');
    const hasAccess = await verifyAccesToWorkspace(workspaceId);
    if (hasAccess.status !== 200) return redirect(`/dashboard/${auth.user.workspace[0].id}`);
    if (!hasAccess.data?.workspace) return null;
    
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ['workspace', workspaceId],
        queryFn: () => getWorkspaceFolders(workspaceId),
    });
    await queryClient.prefetchQuery({
        queryKey: ['user-videos', workspaceId],
        queryFn: () => getAllUserVideos(workspaceId),
    });
    await queryClient.prefetchQuery({
        queryKey: ['user-workspaces', workspaceId],
        queryFn: () => getWorkspaces(),
    });
    await queryClient.prefetchQuery({
        queryKey: ['user-notifications', workspaceId],
        queryFn: () => getNotifications(),
    });
   
    
    return <HydrationBoundary state={dehydrate(queryClient)}>
        <div>
            <Sidebar activeWorkspaceId={workspaceId} />
            {children}
        </div>
    </HydrationBoundary>

}

export default Layout;