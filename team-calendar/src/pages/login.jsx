import { useState } from 'react'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Login } from '../routes/auth'

export const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const signupSuccess = location.state?.signupSuccess

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)
        const loginData = {
            username,
            password
        }

        try {
            const response = await Login(loginData)
            if (!response.token) {
                throw new Error('The login response did not include an access token.')
            }
            onLogin(response.token, response.user)
            navigate('/calendar', { replace: true })
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setIsSubmitting(false)
        }
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
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <Stack spacing={2.5}>
                            {signupSuccess && <Alert severity="success">{signupSuccess}</Alert>}
                            <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth autoFocus />
                            <TextField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" fullWidth />
                            {error && <Alert severity="error">{error}</Alert>}
                            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
                                Log In
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                    Don't have an account? <Link to="/signup">Create Account here</Link>
                </Typography>
            </Box>
        </Box>
    )
}
