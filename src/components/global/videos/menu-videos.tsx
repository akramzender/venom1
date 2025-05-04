import React from "react";
import { string } from "zod";
import Modal from "../modal";
import { Move } from "lucide-react";
import ChangeVideoLocation from "@/components/forms/change-video-location";

type Props = {
    videoId: string
    currentworkspace? : string
    currentFolder? : string
    currentFolderName? :  string
}

const CardMenu = ({videoId,currentFolder,currentFolderName,currentworkspace}:Props)=> {
    return <Modal className="flex items-center cursor-pointer gap-x-2"
     title="Move to new Workspace/Folder"       
    description="This action cannot be undone. This will permanently delete your account and remove your data from our servers"
    trigger={
        <Move
        size={20}
        fill="#a4a4a4"
        className="text-[#a4a4a4]"/>
    }><ChangeVideoLocation currentFolder = {currentFolder}
                           currentworkspace= {currentworkspace}
                           videoId={videoId}
                           currentFolderName = {currentFolderName} />
    </Modal>
}
export default CardMenu