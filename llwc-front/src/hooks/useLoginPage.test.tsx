import { act, renderHook } from '@testing-library/react';
import useLoginPage from './useLoginPage';
import { UserAPI } from '../apis/UserAPI';

jest.mock('../apis/UserAPI');
describe('useLoginPage', () => {
    test('handleLogin', async () => {
        (UserAPI.session as jest.Mock).mockResolvedValue({ data: { is_authenticated: true } });
        const { result } = renderHook(() => useLoginPage());
        await act(() => {
            result.current.handleLogin();
        });
        expect(UserAPI.login).toHaveBeenCalledTimes(1);
        expect(UserAPI.login).toHaveBeenCalledWith({ email: '', password: '' });
        expect(UserAPI.session).toHaveBeenCalledTimes(2);
    });
});
