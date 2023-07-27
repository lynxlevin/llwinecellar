import { useEffect, useCallback } from 'react';
import { UserAPI } from "../apis/UserAPI";


const useLoginPage = () => {
    const consoleLogSession = useCallback(async () => {
        const session_res = await UserAPI.session();
        console.log(session_res);
    }, []);

    const login = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
        // MYMEMO: credentials hard coded
        // MYMEMO: handle errors
        await UserAPI.login({email: 'test@test.com', password: 'test'});
        consoleLogSession();
        // MYMEMO: add redirect
    };

    const logout = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await UserAPI.logout();
        consoleLogSession();
    };

    useEffect(() => {
        void consoleLogSession();
    }, [consoleLogSession]);

    return {
        login,
        logout,
    }
}

export default useLoginPage;