/* eslint-disable testing-library/no-unnecessary-act */
import { fireEvent, render, screen, within, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';
import listCellarResponse from './stub_fixtures/listCellarResponse.json';
import listWineTagResponse from './stub_fixtures/listWineTagResponse.json';
import listWineRegionResponse from './stub_fixtures/listWineRegionResponse.json';
import listGrapeMasterResponse from './stub_fixtures/listGrapeMasterResponse.json';
import listWineResponse from './stub_fixtures/listWineResponse.json';

// Mui testing reference: https://jskim1991.medium.com/react-dont-give-up-on-testing-when-using-material-ui-with-react-ff737969eec7

const mockCreateWine = jest.fn();
const mockUpdateWine = jest.fn();

const getToday = () => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

const server = setupServer(
    rest.get('/user/session/', (req, res, ctx) => {
        return res(ctx.json({ is_authenticated: true }));
    }),
    rest.get('/user/csrf/', (req, res, ctx) => {
        return res(ctx.json({ detail: 'CSRF cookie set' }));
    }),
    rest.get('/api/cellars/', (req, res, ctx) => {
        return res(ctx.json(listCellarResponse));
    }),
    rest.get('/api/wine_tags/', (req, res, ctx) => {
        return res(ctx.json(listWineTagResponse));
    }),
    rest.get('/api/wine_regions/', (req, res, ctx) => {
        return res(ctx.json(listWineRegionResponse));
    }),
    rest.get('/api/grape_masters/', (req, res, ctx) => {
        return res(ctx.json(listGrapeMasterResponse));
    }),
    rest.get('/api/wines/', (req, res, ctx) => {
        return res(ctx.json(listWineResponse));
    }),
    rest.post('/api/wines/', async (req, res, ctx) => {
        const body = await req.json();
        mockCreateWine(body);
        return res(ctx.json({}));
    }),
    rest.put('/api/wines/:wineId', async (req, res, ctx) => {
        const wineId = req.params.wineId;
        const body = await req.json();
        mockUpdateWine(wineId, body);
        return res(ctx.json({}));
    }),
);

beforeAll(() => server.listen());
afterEach(() => {
    window.history.pushState({}, '', '/');
    server.resetHandlers();
});
afterAll(() => server.close());

describe('WineDialog', () => {
    describe('on_create', () => {
        const emptyWineData = {
            name: '',
            producer: '',
            country: null,
            region_1: '',
            region_2: '',
            region_3: '',
            region_4: '',
            region_5: '',
            cepages: [],
            vintage: null,
            bought_at: getToday(),
            bought_from: '',
            price: null,
            drunk_at: null,
            note: '',
            tag_texts: [],
            cellar_id: null,
            position: null,
        };
        it('save__cellar_and_position_selected', async () => {
            render(<App />, { wrapper: BrowserRouter });

            fireEvent.click(screen.getByText('Wine List'));
            const emptyRack = await screen.findByText('2-2');

            fireEvent.click(emptyRack);
            fireEvent.click(emptyRack);
            const modal = within(await screen.findByRole('dialog'));

            act(() => {
                userEvent.type(modal.getByLabelText('name'), 'test_wine');
                userEvent.click(modal.getByRole('button', { name: 'save' }));
            });
            await waitFor(() => {
                expect(mockCreateWine).toHaveBeenCalledWith({
                    ...emptyWineData,
                    name: 'test_wine',
                    cellar_id: 'cellar00-0000-0000-0000-000000000000',
                    position: '2-2',
                });
            });
        });

        it('save__not_in_cellar', async () => {
            render(<App />, { wrapper: BrowserRouter });

            fireEvent.click(screen.getByText('Wine List'));
            const emptyRack = await screen.findByText('2-2');

            fireEvent.click(emptyRack);
            fireEvent.click(emptyRack);
            const modal = within(await screen.findByRole('dialog'));

            act(() => {
                userEvent.type(modal.getByLabelText('name'), 'test_wine');
                userEvent.click(modal.getByLabelText('cellar'));
            });
            const cellarChoices = within(await screen.findByRole('listbox'));
            act(() => {
                userEvent.click(cellarChoices.getByText('NOT_IN_CELLAR'));
            });
            act(() => {
                userEvent.click(modal.getByRole('button', { name: 'save' }));
            });
            await waitFor(() => {
                expect(mockCreateWine).toHaveBeenCalledWith({
                    ...emptyWineData,
                    name: 'test_wine',
                    cellar_id: null,
                    position: null,
                });
            });
        });
    });
    describe('on_edit', () => {
        it('save__dont_move', async () => {
            render(<App />, { wrapper: BrowserRouter });

            fireEvent.click(screen.getByText('Wine List'));
            const filledRack = await screen.findByText('1-1');

            fireEvent.click(filledRack);
            fireEvent.click(filledRack);
            const modal = within(await screen.findByRole('dialog'));

            act(() => {
                userEvent.click(modal.getByRole('button', { name: 'save' }));
            });

            const { id: expectedWineId, cellar_id, position, ...expected } = listWineResponse.wines[0];

            await waitFor(() => {
                expect(mockUpdateWine).toHaveBeenCalledWith(expectedWineId, expected);
            });
        });

        it('save__change_position', async () => {
            render(<App />, { wrapper: BrowserRouter });

            fireEvent.click(screen.getByText('Wine List'));
            const filledRack = await screen.findByText('1-1');

            fireEvent.click(filledRack);
            fireEvent.click(filledRack);
            const modal = within(await screen.findByRole('dialog'));
            const positionInput = modal.getByLabelText('position');

            act(() => {
                userEvent.click(modal.getByLabelText("don't move"));
                userEvent.clear(positionInput);
                userEvent.type(positionInput, '2-2');
                userEvent.click(modal.getByRole('button', { name: 'save' }));
            });

            const { id: expectedWineId, ...expected } = listWineResponse.wines[0];

            await waitFor(() => {
                expect(mockUpdateWine).toHaveBeenCalledWith(expectedWineId, {
                    ...expected,
                    position: '2-2',
                });
            });
        });

        it('save__not_in_cellar', async () => {
            render(<App />, { wrapper: BrowserRouter });

            fireEvent.click(screen.getByText('Wine List'));
            const filledRack = await screen.findByText('1-1');

            fireEvent.click(filledRack);
            fireEvent.click(filledRack);
            const modal = within(await screen.findByRole('dialog'));

            act(() => {
                userEvent.click(modal.getByLabelText("don't move"));
                userEvent.click(modal.getByLabelText('cellar'));
            });
            const cellarChoices = within(await screen.findByRole('listbox'));
            act(() => {
                userEvent.click(cellarChoices.getByText('NOT_IN_CELLAR'));
            });
            act(() => {
                userEvent.click(modal.getByRole('button', { name: 'save' }));
            });

            const { id: expectedWineId, ...expected } = listWineResponse.wines[0];

            await waitFor(() => {
                expect(mockUpdateWine).toHaveBeenCalledWith(expectedWineId, {
                    ...expected,
                    cellar_id: null,
                    position: null,
                });
            });
        });
    });
});
