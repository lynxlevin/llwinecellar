import { act, renderHook } from '@testing-library/react';
import useWineListPage from './useWineListPage';
import { WineData } from '../contexts/wine-context';
import { WineAPI } from '../apis/WineAPI';
import { SelectChangeEvent } from '@mui/material';
import React from 'react';

jest.mock('../apis/UserAPI');
jest.mock('../apis/WineAPI');

describe('useWineListPage.useEffect', () => {
    test('not logged in', () => {
        renderHook(() => useWineListPage());
        expect(WineAPI.list).toBeCalledTimes(0);
    });
    // MYMEMO: test when logged in, trying the sequence in useLoginPage didn't work
});

test('useWineListPage.handleCellarSelect', async () => {
    const dummyCellarId = 'dummyCellarId';
    const { result } = renderHook(() => useWineListPage());
    act(() => {
        result.current.handleCellarSelect({ target: { value: dummyCellarId } } as SelectChangeEvent);
    });
    expect(result.current.selectedCellars).toStrictEqual([dummyCellarId]);
});

test('useWineListPage.handleRequestSort', async () => {
    const dummyProperty = 'dummyProperty';
    const { result } = renderHook(() => useWineListPage());
    act(() => {
        result.current.handleRequestSort({} as React.MouseEvent<unknown>, dummyProperty as keyof WineData);
    });
    expect(result.current.order).toBe('asc');
    expect(result.current.orderBy).toBe(dummyProperty);
    act(() => {
        result.current.handleRequestSort({} as React.MouseEvent<unknown>, dummyProperty as keyof WineData);
    });
    expect(result.current.order).toBe('desc');
    expect(result.current.orderBy).toBe(dummyProperty);
});

test('useWineListPage.handleChangePage', async () => {
    const { result } = renderHook(() => useWineListPage());
    expect(result.current.page).toBe(0);
    act(() => {
        result.current.handleChangePage({} as unknown, 1);
    });
    expect(result.current.page).toBe(1);
});

test('useWineListPage.handleChangeRowsPerPage', async () => {
    const { result } = renderHook(() => useWineListPage());
    act(() => {
        result.current.handleChangeRowsPerPage({ target: { value: '30' } } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.rowsPerPage).toBe(30);
    expect(result.current.page).toBe(0);
});
