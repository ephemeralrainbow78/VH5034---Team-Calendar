import { Box, Button, Chip, Stack, Typography } from "@mui/material"
import { Add, FiberManualRecord, FileDownloadDoneOutlined, Groups, Logout } from "@mui/icons-material"
import { Link } from "react-router-dom"

export const CalendarHeader = ({ onExport, onAddAbsence, currentUser, onLogout }) => {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Typography variant="h4" component="h1">
                        Team Calendar
                    </Typography>
                    <Chip size="small" icon={<FiberManualRecord sx={{ fontSize: 10 }} color="success" />} label="Live" sx={{ bgcolor: '#e7f5ec', color: '#12825a', fontWeight: 700, '& .MuiChip-icon': { ml: '8px' } }} />
                </Stack>
                <Typography variant="body2" sx={{ my: 0.5 }}>
                    {currentUser ? `Signed in ${currentUser.name} - ${currentUser.team}` : `A view of the team's calendar`}
                </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
                {currentUser?.role?.toLowerCase() === 'admin' && (
                    <Button component={Link} to="/teams" variant="outlined" color="inherit" startIcon={<Groups />} sx={{ borderColor: '#d8d7d3', color: 'text.primary' }}>
                        Manage Teams
                    </Button>
                )}
                <Button variant="outlined" color="inherit" startIcon={<FileDownloadDoneOutlined />} onClick={onExport} sx={{ borderColor: '#d8d7d3', color: 'text.primary' }}>
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