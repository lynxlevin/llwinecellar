import { act, renderHook } from '@testing-library/react';
import useLoginPage from './useLoginPage';
import { UserAPI } from '../apis/UserAPI';

jest.mock('../apis/UserAPI');
describe('useLoginPage', () => {
    test('handleLogin', () => {
        const { result } = renderHook(() => useLoginPage());
        act(() => {
            result.current.handleLogin();
        });
        expect(UserAPI.login).toHaveBeenCalledTimes(1);
        expect(UserAPI.login).toHaveBeenCalledWith({ email: '', password: '' });
    });

    test('handleLogout', () => {
        const { result } = renderHook(() => useLoginPage());
        act(() => {
            result.current.handleLogout();
        });
        expect(UserAPI.logout).toHaveBeenCalledTimes(1);
    });
});
