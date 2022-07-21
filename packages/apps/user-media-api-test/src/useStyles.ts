import { makeStyles } from '@material-ui/core/styles';
import type { ClassNameMap } from '@material-ui/styles/withStyles';

export type TClasses = ClassNameMap<
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
    appBar: {
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 'auto',
      backgroundColor: 'transparent',
    },
    formControl: {
      margin: theme.spacing(1),
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
    drawer: { width: '320px' },
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
  };
});

export default useStyles;
