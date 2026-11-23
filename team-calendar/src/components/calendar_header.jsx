import { Box, Button, Stack, Typography } from "@mui/material"
import { AccountCircle, Add, FileDownloadDoneOutlined, Groups, Logout } from "@mui/icons-material"
import { Link } from "react-router-dom"

export const CalendarHeader = ({ onExport, exportDisabled = false, onAddAbsence, currentUser, onLogout }) => {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Typography variant="h4" component="h1">
                        Team Calendar
                    </Typography>
                </Stack>
                <Typography variant="body2" sx={{ my: 0.5 }}>
                    {currentUser ? `Signed in ${currentUser.first_name} - ${currentUser.team}` : `A view of the team's calendar`}
                </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
                <Button component={Link} to="/account" variant="outlined" color="inherit" startIcon={<AccountCircle />} sx={{ borderColor: '#d8d7d3', color: 'text.primary' }}>
                    My Account
                </Button>
                {currentUser?.role?.toLowerCase() === 'admin' && (
                    <Button component={Link} to="/teams" variant="outlined" color="inherit" startIcon={<Groups />} sx={{ borderColor: '#d8d7d3', color: 'text.primary' }}>
                        Manage Teams
                    </Button>
                )}
                <Button variant="outlined" color="inherit" startIcon={<FileDownloadDoneOutlined />} onClick={onExport} disabled={exportDisabled} sx={{ borderColor: '#d8d7d3', color: 'text.primary' }}>
                    Export
                </Button>
                <Button variant="contained" color="primary" startIcon={<Add />} onClick={onAddAbsence}>
                    Add Absence
                </Button>
                {onLogout ?(
                    <Button variant="outlined" color="inherit" startIcon={<Logout/>} onClick={onLogout} sx={{borderColor: '#d8d7d3', color: 'text.primary'}}>
                        Log Out
                    </Button>
                    ): null}
            </Stack>
        </Box>
    )
}