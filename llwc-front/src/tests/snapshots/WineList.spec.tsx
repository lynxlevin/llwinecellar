import { fireEvent, render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../../App';
import { BrowserRouter } from 'react-router-dom';
import listCellarResponse from '../stub_fixtures/listCellarResponse.json';
import listWineTagResponse from '../stub_fixtures/listWineTagResponse.json';
import listWineRegionResponse from '../stub_fixtures/listWineRegionResponse.json';
import listWineResponse from '../stub_fixtures/listWineResponse.json';

const server = setupServer(
    rest.get('/user/session/', (req, res, ctx) => {
        return res(ctx.json({ is_authenticated: true }));
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
    rest.get('/api/wines/', (req, res, ctx) => {
        return res(ctx.json(listWineResponse));
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('WineList page', async () => {
    const { container } = render(<App />, { wrapper: BrowserRouter });

    await fireEvent.click(screen.getByText('Wine List'));
    await screen.findByText('1-1');

    expect(container).toMatchSnapshot();
});
