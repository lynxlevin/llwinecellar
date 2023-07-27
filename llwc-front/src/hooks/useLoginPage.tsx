import { useState } from 'react';
import { UserAPI } from "../apis/UserAPI";


const useLoginPage = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const consoleLogSession = async () => {
        const session_res = await UserAPI.session();
        console.log(session_res);
    };

    const handleEmailInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setEmail(event.target.value);
    };

    const handlePasswordInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPassword(event.target.value);
    };

    const handleLogin = async () => {
        console.log({
            email,
            password,
        });
        // MYMEMO: credentials hard coded
        // MYMEMO: handle errors
        await UserAPI.login({email: 'test@test.com', password: 'test'});
        consoleLogSession();
        // MYMEMO: add redirect
    };

    const handleLogout = async() => {
        await UserAPI.logout();
        consoleLogSession();
    };

    return {
        handleLogin,
        handleLogout,
        handleEmailInput,
        handlePasswordInput,
    }
}

export default useLoginPage;