import React from "react";
import Loader from "../loader";
import CardMenu from "./menu-videos";
import CopyLink from "./copy-link";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dot, Share2, User } from "lucide-react";

type Props = {
  User: {
    firstname: string | null;
    lastname: string | null;
    image: string | null;
  } | null;
  id: string;
  Folder: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  title: string | null;
  source: string;
  processing: boolean;
  workspaceId: string;
};

const VideoCard = (props: Props) => {
  const daysAgo = Math.floor(
    (new Date().getTime() - props.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  );

  return (
    <Loader
      className="bg-[#171717] flex justify-center items-center border-[1px] border-[#252525] rounded-xl shadow-md"
      state={props.processing}
    >
      <div className="overflow-hidden cursor-pointer bg-[#171717] relative border-[1px] border-[#252525] flex flex-col rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg">
        {/* Options Menu and CopyLink */}
        <div className="absolute top-3 right-3 z-50 flex flex-col items-center gap-y-3">
          <CardMenu
            currentFolderName={props.Folder?.name}
            videoId={props.id}
            currentworkspace={props.workspaceId}
            currentFolder={props.Folder?.id}
          />
          <CopyLink className="p-0 h-3 bg-transparent cursor-pointer" videoId={props.id} />
        </div>

        {/* Video Preview */}
        <Link
          href={`/preview/${props.id}`}
          className="hover:bg-[#252525] transition duration-150 flex flex-col justify-between h-full"
        >
          <video
            controls={false}
            preload="metadata"
            className="w-full aspect-video opacity-50 z-20 rounded-t-lg"
          >
            <source
              src={`${process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL}/${props.source}#t=1`}
            ></source>
          </video>

          {/* Video Details */}
          <div className="px-5 py-3 flex flex-col gap-2 z-20">
            <h2 className="text-sm font-semibold text-[#BDBDBD] truncate">
              {props.title}
            </h2>
            <div className="flex gap-x-2 items-center mt-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={props.User?.image as string} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="capitalize text-sm text-[#BDBDBD]">
                  {props.User?.firstname}
                </p>
                <p className="text-[#6b6b6b] text-xs flex items-center">
                  <Dot /> {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                </p>
              </div>
            </div>

            {/* Workspace Info */}
            <div className="mt-4">
              <span className="flex gap-x-1 items-center">
                <Share2
                  fill="#9D9D9D"
                  className="text-[#9D9D9D]"
                  size={12}
                />
                <p className="text-xs text-[#9D9D9D] capitalize">
                  {props.User?.firstname}'s Workspace
                </p>
              </span>
            </div>
          </div>
        </Link>
      </div>
    </Loader>
  );
};

export default VideoCard;