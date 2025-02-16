import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Button } from '@mui/material';
import { BrowserRouter as Link, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';


const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0,),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);


export default function SideNav() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [user, setUser] = React.useState(null);


    const logout = () => {
        localStorage.clear();
        window.location = "/";
    };
    const navigate = useNavigate();
    const handleClickHome = () => {
        navigate("/")
    }
    const handleManageEvents = () => {
        navigate("/")
    }


    return (

        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ backgroundColor: 'primaryColor' }}  >
                    <Toolbar sx={{ display: 'flex', ml: 0, pl: 0 }} style={{ paddingLeft: "0.5%" }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={() => { setOpen(!open) }}
                            edge="start"
                            sx={{ ml: 1, mr: 4 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <img src="https://i.ibb.co/4R8WzBs/ecowise.png" alt="EcoWise" height={'32'} />
                        {/*} <Typography variant="h6" noWrap component="div">
              Uplay
            </Typography>*/}
                        <Box sx={{ flexGrow: 1 }}></Box>
                        {user && (
                            <>
                                <Typography sx={{ color: '#dddddd' }} >{user.name}</Typography>
                                &nbsp;&nbsp;
                                <Button onClick={logout}>Logout</Button>
                            </>
                        )
                        }
                        {!user && (
                            <>
                                <a href="/register" ><Typography sx={{ color: '#dddddd' }} >Register</Typography></a>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <a href="/login" ><Typography sx={{ color: '#dddddd' }} >Login</Typography></a>

                            </>
                        )}
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open} sx={{ backgroundColor: 'primaryColor' }} >
                    <DrawerHeader>
                        <IconButton onClick={() => { setOpen(!open) }}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </DrawerHeader>
                    <Divider sx={{ backgroundColor: 'primaryColor' }} />
                    <List sx={{ backgroundColor: 'primaryColor', height: '100%' }} >

                        <ListItem onClick={handleClickHome} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <HomeIcon style={{ color: '#ffffff' }} />
                                </ListItemIcon>
                                {open && (
                                    <>
                                        <ListItemText primary="Overview" sx={{ color: '#ffffff' }} />
                                    </>
                                )}
                            </ListItemButton>
                        </ListItem>

                        <ListItem onClick={handleManageEvents} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <SettingsIcon style={{ color: '#ffffff' }} />
                                </ListItemIcon>
                                {open && (
                                    <>
                                        <ListItemText primary="Manage Events" sx={{ color: '#ffffff' }} />
                                    </>
                                )}
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Drawer>

            </Box>
        </>
    );
}