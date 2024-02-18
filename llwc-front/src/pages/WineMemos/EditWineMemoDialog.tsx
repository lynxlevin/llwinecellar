import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
} from '@mui/material';
import { useState } from 'react';
import { IWineMemo, WineMemoAPI } from '../../apis/WineMemoAPI';

interface EditWineMemoDialogProps {
    onClose: () => void;
    wineMemo: IWineMemo;
    setWineMemos: React.Dispatch<React.SetStateAction<IWineMemo[]>>;
}

const EditWineMemoDialog = (props: EditWineMemoDialogProps) => {
    const { onClose, wineMemo, setWineMemos } = props;

    const [title, setTitle] = useState(wineMemo.title);
    const [entry, setEntry] = useState(wineMemo.entry);

    const handleSubmit = async () => {
        const data = {
            title,
            entry,
        };

        WineMemoAPI.update(wineMemo.id, data).then(({ data: wineMemoRes }) => {
            setWineMemos(prev => {
                const wineMemos = [...prev];
                wineMemos[wineMemos.findIndex(p => p.id === wineMemo.id)] = wineMemoRes;
                return wineMemos;
            });
            onClose();
        });
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth>
            <DialogContent>
                <TextField value={title} onChange={event => setTitle(event.target.value)} label='タイトル' multiline fullWidth minRows={1} />
                <TextField value={entry} onChange={event => setEntry(event.target.value)} label='内容' multiline fullWidth minRows={5} />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', py: 2 }}>
                <Button variant='contained' onClick={handleSubmit}>
                    修正する
                </Button>
                <Button variant='outlined' onClick={onClose} sx={{ color: 'primary.dark' }}>
                    キャンセル
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditWineMemoDialog;
