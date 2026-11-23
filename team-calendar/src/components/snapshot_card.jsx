import { Box, Paper, Stack, Typography } from "@mui/material"

export const SnapshotCard = ({icon, title, value, caption}) => {
    return (
        <Paper variant="outlined" sx={{flex:'1 1 220px', minWidth: 0, p: 2.5, borderColor: 'divider'}}>
            <Stack direction="row" sx={{justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <Typography variant="body2" sx={{fontWeight: 600, color: 'text.secondary'}}>
                    {title}
                </Typography>
                <Box sx={{color: 'text.secondary', display: 'flex'}}>{icon}</Box>
            </Stack>
            <Typography variant="h4" sx={{mt: 1}}>
                {value}
            </Typography>
            <Typography variant="body2" sx={{mt:0.5, fontSize: 13}}>
                {caption}
            </Typography>
        </Paper>
    )
}