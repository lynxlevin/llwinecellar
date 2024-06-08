import appIcon from '../assets/icon_295.png';

const AppIcon = ({ height }: { height: number }) => {
    return <img src={appIcon} alt='app_icon' height={height} width={height} />;
};

export default AppIcon;
