import React, { Children } from "react";
import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";

interface Props {
    state: boolean;
    className?: string;
    color? :string
    children? : React.ReactNode
}

const Loader = ({ state, className }: Props) => {
    return state? (
        <div className={cn(className)} >
            <Spinner/>
        </div>
    ):(
        Children
    )
}

export default Loader;