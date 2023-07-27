import { act, renderHook } from '@testing-library/react';
import useLoginPage from './useLoginPage';
import { UserAPI } from '../apis/UserAPI';

jest.mock('../apis/UserAPI');

describe('useLoginPage.handleLogin', () => {
    test('handleLogin', async () => {
        (UserAPI.session as jest.Mock).mockResolvedValue({ data: { is_authenticated: true } });
        const { result } = renderHook(() => useLoginPage());
        act(() => {
            result.current.handleEmailInput({ target: { value: 'test@test.com' } } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
            result.current.handlePasswordInput({ target: { value: 'password' } } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
        });
        await act(() => {
            result.current.handleLogin();
        });
        expect(UserAPI.login).toHaveBeenCalledTimes(1);
        expect(UserAPI.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
        expect(UserAPI.session).toHaveBeenCalledTimes(2);
    });
    test('handleLogin without email fails on validation', async () => {
        (UserAPI.session as jest.Mock).mockResolvedValue({ data: { is_authenticated: true } });
        const { result } = renderHook(() => useLoginPage());
        act(() => {
            result.current.handlePasswordInput({ target: { value: 'password' } } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
        });
        await act(() => {
            result.current.handleLogin();
        });
        expect(UserAPI.login).toHaveBeenCalledTimes(0);
        expect(UserAPI.session).toHaveBeenCalledTimes(1);
        expect(result.current.errorMessage).toBe('Please input email.');
    });
    test('handleLogin without password fails on validation', async () => {
        (UserAPI.session as jest.Mock).mockResolvedValue({ data: { is_authenticated: true } });
        const { result } = renderHook(() => useLoginPage());
        act(() => {
            result.current.handleEmailInput({ target: { value: 'test@test.com' } } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
        });
        await act(() => {
            result.current.handleLogin();
        });
        expect(UserAPI.login).toHaveBeenCalledTimes(0);
        expect(UserAPI.session).toHaveBeenCalledTimes(1);
        expect(result.current.errorMessage).toBe('Please input password.');
    });
});
