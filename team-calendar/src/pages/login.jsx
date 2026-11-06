import {useState} from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { Login } from '../routes/auth'

export const LoginPage = () => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()

        const loginData = {
            "username": username,
            "password": password
        }

        Login(loginData)
    }

    return(
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 420}}>
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Team Calendar
                    </Typography>
                </Stack>
                <Paper variant="outlined" sx={{borderColor: 'divider', p: {xs: 3, md: 4}}}>
                    <Typography variant="h6">Log In</Typography>
                    <Box component="form" noValidate sx={{ mt: 1 }}>
                        <Stack spacing={2.5}>
                            <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth autoFocus />
                            <TextField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" fullWidth />
                            <Button type="submit" variant="contained" size="large" onClick={handleSubmit} fullWidth>
                                Log In
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                    Don't have an account? <Link component="button" type="button" underline="hover" onClick={() => window.location.href = '/signup'}>Create Account here </Link>
                </Typography>
            </Box>
        </Box>
    )
}
