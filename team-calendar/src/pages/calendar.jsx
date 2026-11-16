import { Box, Container, Divider, Paper, Stack, Typography } from "@mui/material"
import { CalendarHeader } from "../components/calendar_header"
import { SnapshotCards } from "../components/snapshot_cards"
import { CalendarToolbar } from "../components/calendar_toolbar"

export const CalendarPage = () => {

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 3, md: 5 } }}>
            <Container maxWidth="lg">
                <CalendarHeader />
                <Box>
                    <Stack direction='row' sx={{ flexWrap: 'wrap', mb: 1.5, justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            Today's Snapshot
                        </Typography>
                        <Typography variant="caption" color="text.seconday">
                            Last Synced at
                        </Typography>
                    </Stack>
                    <SnapshotCards />
                </Box>
                <Paper variant="outlined" sx={{ borderColor: 'divider' }}>
                    <Box sx={{ p: { xs: 2, md: 3 } }}>
                        <CalendarToolbar />
                    </Box>
                    <Divider />
                </Paper>
            </Container>
        </Box>
    )
}