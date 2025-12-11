import {useState, useEffect} from 'react';

const useLocalStorage = (key:string, initialValue:any) => {
    const [state, setState] = useState(() => {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);



    return [state, setState];
};

export default useLocalStorage;