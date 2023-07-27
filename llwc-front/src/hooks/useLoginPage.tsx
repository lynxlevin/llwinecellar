import { useState, useEffect } from 'react';
import { UserAPI } from '../apis/UserAPI';

const useLoginPage = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const handleEmailInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setEmail(event.target.value);
    };

    const handlePasswordInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPassword(event.target.value);
    };

    const checkSession = async () => {
        const session_res = await UserAPI.session();
        setIsLoggedIn(session_res.data.is_authenticated);
    };

    const handleLogin = async () => {
        // MYMEMO: handle errors
        await UserAPI.login({ email, password });
        checkSession();
    };

    useEffect(() => {
        void checkSession();
    }, []);

    return {
        isLoggedIn,
        handleLogin,
        handleEmailInput,
        handlePasswordInput,
    };
};

export default useLoginPage;
