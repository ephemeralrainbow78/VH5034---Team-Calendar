import { createTheme } from '@mui/material/styles'

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1e6f5c',
            light: '#3c8e79',
            dark: '#15503f',
            contrastText: '#ffffff'
        },
        success: {
            main: '#1e6f5c',
        },
        background: {
            default: '#f6f6fd',
            paper: '#ffffff'
        },
        text: {
            primary: '#17171a',
            secondary: '#6b6b70'
        },
        divider: '#e6e5e2'
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
        h4: {
            fontWeight: 700,
            letterSpacing: '-0.5',
        },
        h6: {
            fontWeight: 700,
        },
        body2: {
            color: '#6b6b70',
        }
    },
    shape: {
        borderRadius: 10
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },
    },
});

export default theme