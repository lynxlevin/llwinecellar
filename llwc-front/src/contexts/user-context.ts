import { createContext } from 'react';

export interface UserContextType {
    isLoggedIn: boolean | null;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
}

export const UserContext = createContext({ isLoggedIn: null, setIsLoggedIn: () => {} } as unknown as UserContextType);
