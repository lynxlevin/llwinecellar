import appIcon from '../assets/icon_295.png';

const AppIcon = ({ height }: { height: number }) => {
    return (
        <img
            srcSet={`${appIcon}?w=${height}&h=${height}&fit=crop&auto=format`}
            src={`${appIcon}?w=${height}&h=${height}&fit=crop&auto=format`}
            alt="app_icon"
            height={height}
            width={height}
        />
    );
};

export default AppIcon;
