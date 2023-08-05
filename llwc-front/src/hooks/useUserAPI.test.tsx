import { renderHook, waitFor } from '@testing-library/react';
import { UserAPI } from '../apis/UserAPI';
import { CellarAPI } from '../apis/CellarAPI';
import useUserAPI from './useUserAPI';

jest.mock('../apis/UserAPI');
jest.mock('../apis/CellarAPI');

describe('useUserAPI.useEffect', () => {
    test('is_authenticated: true', async () => {
        (UserAPI.session as jest.Mock).mockResolvedValue({ data: { is_authenticated: true } });
        (CellarAPI.list as jest.Mock).mockResolvedValue({ data: { cellars: [] } });
        renderHook(() => useUserAPI());
        expect(UserAPI.session).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(CellarAPI.list).toHaveBeenCalledTimes(1);
        });
        // MYMEMO: test context update: Maybe impossible without rendering UI?
    });
    test('is_authenticated: false', async () => {
        (UserAPI.session as jest.Mock).mockResolvedValue({ data: { is_authenticated: false } });
        renderHook(() => useUserAPI());
        expect(UserAPI.session).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(CellarAPI.list).toHaveBeenCalledTimes(0);
        });
        // MYMEMO: test context update: Maybe impossible without rendering UI?
    });
});

describe('useUserAPI.handleLogout', () => {
    test('handleLogout', async () => {
        (UserAPI.session as jest.Mock).mockResolvedValue({ data: { is_authenticated: true } });
        (CellarAPI.list as jest.Mock).mockResolvedValue({ data: { cellars: [] } });
        const { result } = renderHook(() => useUserAPI());
        result.current.handleLogout();
        expect(UserAPI.session).toHaveBeenCalledTimes(1);
        await waitFor(() => {
            expect(CellarAPI.list).toHaveBeenCalledTimes(1);
        });
        expect(UserAPI.logout).toHaveBeenCalledTimes(1);
    });
});
