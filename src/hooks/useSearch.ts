import { useState } from "react"

export const useSearch = (key:string,type:'WORKSPACE') => {
    const [query, setQuery] = useState('');
    const [debounce, setDebounce] = useState('');
    const [user, setOnUser] = useState<{
        id: string;
        subscription:{
            plan:'PRO' | 'FREE';
        } | null
        firstname:string | null;
        lastname:string | null;
        email:string | null;
        image:string | null;
    } []
    | undefined>(undefined);
    
    return { query, setQuery };
}
