import appIcon from '../assets/icon.png';

const AppIcon = ({ height }: { height: number }) => {
    return (
        <img
            srcSet={`${appIcon}?w=${height}&h=${height}&fit=crop&auto=format&dpr=${height} ${height}x`}
            src={`${appIcon}?w=${height}&h=${height}&fit=crop&auto=format`}
            alt="app_icon"
        />
    );
};

export default AppIcon;
