import { useState, useEffect } from 'react';
import { UserAPI } from '../apis/UserAPI';

const useLoginPage = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleEmailInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        setEmail(event.target.value);
    };

    const handlePasswordInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPassword(event.target.value);
    };

    const handleLogin = async () => {
        if (inputIsValid()) {
            setErrorMessage(null);
            try {
                await UserAPI.login({ email, password });
                checkSession();
            } catch (err: any) {
                setErrorMessage(err.response.data.detail);
            }
        }
    };

    const inputIsValid = () => {
        if (email === '') {
            setErrorMessage('Please input email.');
            return false;
        }
        if (password === '') {
            setErrorMessage('Please input password.');
            return false;
        }
        return true;
    };

    const checkSession = async () => {
        const session_res = await UserAPI.session();
        setIsLoggedIn(session_res.data.is_authenticated);
    };

    useEffect(() => {
        void checkSession();
    }, []);

    return {
        errorMessage,
        isLoggedIn,
        handleLogin,
        handleEmailInput,
        handlePasswordInput,
    };
};

export default useLoginPage;
