import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';

// Originally copied from https://mui.com/material-ui/react-table/#sorting-amp-selecting

interface WineData {
    id: string;
    drink_when: string;
    name: string;
    producer: string;
    country: string;
    region_1: string;
    region_2: string;
    region_3: string;
    region_4: string;
    region_5: string;
    cepage: string;
    vintage: number;
    bought_at: string;
    bought_from: string;
    price_with_tax: number;
    drunk_at: string;
    note: string;
}

function createWineData(
    id: string,
    drink_when: string,
    name: string,
    producer: string,
    country: string,
    region_1: string,
    region_2: string,
    region_3: string,
    region_4: string,
    region_5: string,
    cepage: string,
    vintage: number | null,
    bought_at: string,
    bought_from: string,
    price_with_tax: number,
    drunk_at: string | null,
    note: string,
): WineData {
    return {
        id,
        drink_when,
        name,
        producer,
        country,
        region_1,
        region_2,
        region_3,
        region_4,
        region_5,
        cepage,
        vintage: vintage ?? 0,
        bought_at,
        bought_from,
        price_with_tax,
        drunk_at: drunk_at ?? '',
        note,
    };
}

// prettier-ignore
const wineRows = [
    createWineData("cf7718e9-b7d3-404d-bd3c-ca28d1ade76a", "デイリー", "Le Prince", "Domaine de Roche Ville", "France", "Loire", "Saumur Champigny", "", "", "", "", 2017, "2023-04-18", "エノテカオンライン", 3080, null, ""),
    createWineData("1928f721-3b98-4b5d-ba9a-26b323b558c0", "デイリー", "Village Pinot Noir", "Paul Cluver", "South Africa", "Elgin", "", "", "", "", "", 2020, "2023-04-18", "エノテカオンライン", 2805, null, ""),
    createWineData("83b4afc9-584e-4da5-a5f0-2feb0be75fe4", "そのうち飲む", "Aloxe Corton", "Domaine Charlopin Tissier", "France", "Bourgogne", "Aloxe Corton", "", "", "", "", 2018, "2022-11-26", "伊勢屋", 11880, null, ""),
    createWineData("2d3113d2-83b1-420b-baa8-7d42607f6704", "そのうち飲む", "Cotes de nuits Village", "Domaine Charlopin Tissier", "France", "Bourgogne", "Cotes de nuits", "", "", "", "", 2018, "2022-11-26", "伊勢屋", 7700, null, ""),
    createWineData("9d48576a-7a0c-4d8d-9997-8f124633628c", "数年寝かす", "Chasse Spleen", "Ch. Chasse Spleen", "France", "Bordeaux", "Médoc", "Moulis", "", "", "", 2013, "2019-06-15", "天満屋", 5724, null, "澱はなく、色は濃いめで透き通っている。"),
    createWineData("7d392fc8-a12b-473f-a76e-e0cca7c03d12", "10年弱寝かす", "Charmes Chambertin", "Lou Dumont", "France", "Bourgogne", "Gevrey Chambertin", "Charmes Chambertin", "", "", "", 2016, "2020-08-05", "天満屋岡山", 29590, null, ""),
    createWineData("720f50b2-f95b-4dfd-82de-c0802631e417", "10年強寝かす", "Gevrey Chambertin Lavaux St Jacques 1er", "Claude Dugat", "France", "Bourgogne", "Gevrey Chambertin", "Lavaux st Jacques", "", "", "", 2016, "2019-06-15", "勝田商店", 30780, null, "澱はなく、色はどちらかというと濃いめ。長期熟成が期待できそう。よく透き通っている。"),
    createWineData("fbfac37c-c960-4c03-8d29-ce6749341daa", "たくさん寝かす", "Corton Bressandes GC", "Lucien le Moine", "France", "Bourgogne", "Corton", "", "", "", "", 2012, "2019-06-15", "勝田商店", 17280, null, "綿状の澱僅かにあり、色は微妙に薄め。よく透き通っている。"),
    createWineData("6038fe2c-9aa4-4b3f-812e-aee9537aed0a", "たくさん寝かす", "Chambertin", "Phillipe Charlopin", "France", "Bourgogne", "Gevrey Chambertin", "Chambertin", "", "", "", 2012, "2016-11-05", "安田", 41040, null, "\"同じ物を2017/05/14に飲んでがっかり。確かに早飲みできるものだし、チャーミングな香りも程よい甘さも、ミネラル感や複雑味もあるが、どれもこぢんまりとしていて、全く魅力に感じられない。\nどう熟成するのか読めないが、偉大な畑の片鱗を感じることはできるので、もっとしっかり寝かせて、古酒になりかけてから飲むべき。少しでも早かったら絶対にまたがっかりする。\nこんなにすっと口に馴染んで、優しく飲みやすいワインにしては珍しく、しっかりと強固な刺激も備えている。今でこそ、口に優しくおいしいワインだが、ルロワにこそ叶わないかもしれないけど、熟成すれば閉じたように見えない花が大きく開いて、素晴らしいワインになるのかもしれない。\n死ぬ前の楽しみにとっておく。\""),
    createWineData("34fdd25f-9446-4a6e-b1ec-f1232682fbc9", "", "Chateau Hortevie", "Chateau Hortevie", "France", "Bordeaux", "Médoc", "Saint-Julien", "", "", "", 2002, "2023-03-25", "タカムラ", 4400, "2023-05-05", ""),
    createWineData("94194356-eb78-41a5-af5a-aea5532b181a", "", "Crozes Hermitage", "E. Guigal", "France", "Côtes du Rhône", "Septentrional", "Crozes Hermitage", "", "", "", 2019, "2023-03-25", "タカムラ", 3058, "2023-04-15", ""),
    createWineData("13fff526-2fad-4e5c-a0ac-f3cb4f1ac83e", "", "Te Tera", "Martinborough Vineyartd", "New Zealand", "Wairarapa", "Martinborough", "", "", "", "", 2020, "2023-03-25", "タカムラ", 2780, "2023-04-08", ""),
  ]

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

interface WineHeadCell {
    id: keyof WineData;
    numeric: boolean;
    disablePadding: boolean;
    label: string;
}

function toTitleCase(text: string): string {
    return text
        .toLowerCase()
        .split('_')
        .map(function (word: string) {
            return word.replace(word[0], word[0].toUpperCase());
        })
        .join(' ');
}

function getWineHeadCell(id: keyof WineData, numeric: boolean, disablePadding: boolean): WineHeadCell {
    const label = toTitleCase(id);
    return {
        id,
        numeric,
        disablePadding,
        label,
    };
}

const wineHeadCells: readonly WineHeadCell[] = [
    getWineHeadCell('name', false, false),
    getWineHeadCell('drink_when', false, false),
    getWineHeadCell('producer', false, false),
    getWineHeadCell('country', false, false),
    getWineHeadCell('region_1', false, false),
    getWineHeadCell('region_2', false, false),
    getWineHeadCell('region_3', false, false),
    getWineHeadCell('region_4', false, false),
    getWineHeadCell('region_5', false, false),
    getWineHeadCell('cepage', false, false),
    getWineHeadCell('vintage', true, false),
    getWineHeadCell('bought_at', false, false),
    getWineHeadCell('bought_from', false, false),
    getWineHeadCell('price_with_tax', true, false),
    getWineHeadCell('drunk_at', false, false),
];

interface EnhancedTableHeadProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof WineData) => void;
    order: Order;
    orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property: keyof WineData) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {wineHeadCells.map(headCell => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

interface EnhancedTableToolbarProps {
    tableTitle: string;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const { tableTitle } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                {tableTitle}
            </Typography>
            <Tooltip title="Filter list">
                <IconButton>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>
        </Toolbar>
    );
}

export default function WineList() {
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof WineData>('drink_when');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof WineData) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: string, name: string) => {
        console.log(id);
        console.log(name);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - wineRows.length) : 0;

    const visibleRows = React.useMemo(
        () =>
            wineRows
                .slice()
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [order, orderBy, page, rowsPerPage],
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar tableTitle="Wine List" />
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
                        <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow
                                        hover
                                        onClick={event => handleClick(event, row.id, row.name)}
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={row.name}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell component="th" id={labelId} scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right">{row.drink_when}</TableCell>
                                        <TableCell align="right">{row.producer}</TableCell>
                                        <TableCell align="right">{row.country}</TableCell>
                                        <TableCell align="right">{row.region_1}</TableCell>
                                        <TableCell align="right">{row.region_2}</TableCell>
                                        <TableCell align="right">{row.region_3}</TableCell>
                                        <TableCell align="right">{row.region_4}</TableCell>
                                        <TableCell align="right">{row.region_5}</TableCell>
                                        <TableCell align="right">{row.cepage}</TableCell>
                                        <TableCell align="right">{row.vintage}</TableCell>
                                        <TableCell align="right">{row.bought_at}</TableCell>
                                        <TableCell align="right">{row.bought_from}</TableCell>
                                        <TableCell align="right">{row.price_with_tax}</TableCell>
                                        <TableCell align="right">{row.drunk_at}</TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 53 * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={wineRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
