import { useState, useEffect, useContext } from 'react';
import { UserAPI } from '../apis/UserAPI';
import { CellarContext } from '../contexts/cellar-context';
import { CellarAPI } from '../apis/CellarAPI';

const useLoginPage = () => {
    const cellarContext = useContext(CellarContext);

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
                getCellars();
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

    const getCellars = async () => {
        const res = await CellarAPI.list();
        cellarContext.setList(res.data.cellars);
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
