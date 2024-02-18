import { Button, FormGroup, TextField } from '@mui/material';
import React, { useState } from 'react';
import { IWineMemo, WineMemoAPI } from '../../apis/WineMemoAPI';

interface WineMemoFormProps {
    setWineMemos: React.Dispatch<React.SetStateAction<IWineMemo[]>>;
}

const WineMemoForm = (props: WineMemoFormProps) => {
    const { setWineMemos } = props;

    const [title, setTitle] = useState('');
    const [entry, setEntry] = useState('');

    const handleSubmit = async () => {
        const data = {
            title,
            entry,
        };

        WineMemoAPI.create(data).then(({ data: wineMemo }) => {
            setTitle('');
            setEntry('');
            setWineMemos(prev => {
                return [wineMemo, ...prev];
            });
        });
    };

    return (
        <>
            <FormGroup sx={{ mt: 3 }}>
                <TextField value={title} onChange={event => setTitle(event.target.value)} label='タイトル' multiline minRows={1} />
                <TextField value={entry} onChange={event => setEntry(event.target.value)} label='内容' multiline minRows={5} />
            </FormGroup>
            <Button variant='contained' onClick={handleSubmit} sx={{ mt: 2, mb: 2 }}>
                保存する
            </Button>
        </>
    );
};

export default WineMemoForm;
