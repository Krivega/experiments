import { makeStyles } from '@material-ui/core/styles';
import type { ClassNameMap } from '@material-ui/styles/withStyles';

export type TClasses = ClassNameMap<
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

const useStyles = makeStyles((theme) => {
  return {
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
      transform: 'rotateY(180deg)',
      display: 'flex',
      justifyContent: 'flex-end',
    },
  };
});

export const flex = { display: 'flex', justifyContent: 'space-between' };

export default useStyles;
