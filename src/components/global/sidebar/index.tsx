'use client'
import React from "react";
import Image from "next/image";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { SelectGroup, SelectLabel } from "@radix-ui/react-select";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { userQueryData } from "@/hooks/userQueryData";
import { getWorkspaces } from "@/actions/workspace";
import { Workspace } from "@prisma/client";
import { WorkspaceProps } from "@/types/index.type";
import { PlusCircle } from "lucide-react";
import { Modal } from "../modal";

type WorkspaceResponse = {
    status: number;
    data: {
        workspaces: Array<{
            id: string;
            name: string;
            type: string;
        }>;
        members: Array<{
            Workspace: {
                id: string;
                name: string;
                type: string;
            };
        }>;
    };
}

type Props = {
    activeWorkspaceId: string;
}

export const Sidebar = ({ activeWorkspaceId }: Props) => {
    const router = useRouter();
    const {data,isFetched} = userQueryData(['user-workspaces'],getWorkspaces);
    const workspaces = (data as WorkspaceResponse)?.data?.workspaces || [];

    if (!isFetched) {
        return <div>Loading...</div>;
    }   
    const onChangeActiveWorkspace = (value: string) => {
        router.push(`/dashboard/${value}`);
    }
    return <div className="bg-[#111111] h-screen flex-none relative p-4  w-[250px] flex flex-col gap-4 items-center">
        <div>
            <div className="bg-[#111111] p-4 flex gap-2 justify-center items-center mb-4 absolute top-0 left-0 right-0">
                <Image src="/channel.svg" alt="logo" width={40} height={40} />
                <p className="text-2xl">Venom</p>
            </div>
        </div>
        <Select defaultValue={activeWorkspaceId} onValueChange={onChangeActiveWorkspace}>
            <SelectTrigger className="mt-16 text-neutral-400 bg-transparent border-none">
                <SelectValue placeholder="Select a workspace" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] backdrop-blur-0">
                <SelectGroup>
                    <SelectLabel>Workspaces</SelectLabel>
                    <Separator />
                    {workspaces.map((workspace: { id: string; name: string; type: string }) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                            {workspace.name}
                        </SelectItem>
                    ))}
                    {(data as WorkspaceResponse)?.data?.members?.map((member: { Workspace: { id: string; name: string; type: string } }) => (
                        <SelectItem key={member.Workspace.id} value={member.Workspace.id}>
                            {member.Workspace.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
            <Modal 
                trigger={
                    <span className="text-sm cursor-pointer flex items-center justify-center bg-neutral-800/90 hover:bg-neutral-800/60 w-full rounded-sm p-[5px] gap-2">
                        <PlusCircle size={15} className="text-neutral-800/90 fill-neutral-500" />
                        <span className="text-neutral-400 font-semibold text-xs">Create Workspace</span>
                    </span>
                }
                title="Create Workspace"
                description="Create a new workspace to organize your content"
            >
                <div className="space-y-4">
                    <p>Workspace creation form will go here</p>
                </div>
            </Modal>
        </Select>
    </div>
}

export default Sidebar;