import { makeStyles } from '@material-ui/core/styles';
import type { ClassNameMap } from '@material-ui/styles/withStyles';

export type TClasses = ClassNameMap<
  | 'card'
  | 'appBar'
  | 'video'
  | 'formControl'
  | 'flex'
  | 'buttonGroup'
  | 'drawer'
  | 'fullWidth'
  | 'noPadding'
  | 'extendedIcon'
  | 'backdrop'
>;

const APP_BAR_HEIGHT = 64;
const DRAWER_WIDTH = 320;

const useStyles = makeStyles((theme) => {
  return {
    card: {
      width: '100%',
      backgroundColor: 'black',
      color: 'white',
    },
    appBar: {
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 'auto',
      backgroundColor: 'transparent',
    },
    formControl: {
      width: `100%`,
    },
    buttonGroup: {
      width: `100%`,
      justifyContent: 'center',
    },
    flex: {
      margin: theme.spacing(1),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    drawer: { width: `${DRAWER_WIDTH}px` },
    fullWidth: { width: '100%' },
    noPadding: { padding: '0' },
    extendedIcon: {
      marginRight: theme.spacing(1),
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
    video: {
      maxWidth: `calc(100% - ${DRAWER_WIDTH}px)`,
      transform: 'rotateY(180deg)',
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: `calc(${APP_BAR_HEIGHT}px + 6px)`,
    },
    codes: {
      marginTop: theme.spacing(2),
    },
    drawerRoot: {
      width: `${DRAWER_WIDTH}px`,
      flexShrink: 0,
    },
  };
});

export default useStyles;
