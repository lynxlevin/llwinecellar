import React from 'react';
import {
    Box,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { COLUMN_ORDER, Order } from '../../hooks/useWineSearchPage';
import { WineDataKeys } from '../../contexts/wine-context';


interface WineSearchTableHeadProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: WineDataKeys) => void;
    sortOrder: { key: WineDataKeys; order: Order };
}

export const WineSearchTableHead = (props: WineSearchTableHeadProps) => {
    const { sortOrder, onRequestSort } = props;
    const createSortHandler = (property: WineDataKeys) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    const toTitleCase = (text: WineDataKeys): string => {
        if (text === 'price') return 'Price';
        return text
            .toLowerCase()
            .split('_')
            .map((word: string) => {
                return word.replace(word[0], word[0].toUpperCase());
            })
            .join('');
    };

    return (
        <TableHead>
            <TableRow>
                {COLUMN_ORDER.map(column => (
                    <TableCell key={column} align="left" padding="normal" sortDirection={sortOrder.key === column ? sortOrder.order : false}>
                        <TableSortLabel
                            active={sortOrder.key === column}
                            direction={sortOrder.key === column ? sortOrder.order : 'asc'}
                            onClick={createSortHandler(column as WineDataKeys)}
                        >
                            {toTitleCase(column)}
                            {sortOrder.key === column ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {sortOrder.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};
