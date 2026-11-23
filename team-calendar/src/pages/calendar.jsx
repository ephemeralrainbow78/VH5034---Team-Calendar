import { Box, Container, Divider, Paper, Stack, Typography } from "@mui/material"
import { CalendarHeader } from "../components/calendar_header"
import { SnapshotCards } from "../components/snapshot_cards"
import { CalendarToolbar } from "../components/calendar_toolbar"
import { useEffect, useState } from "react"
import { TODAY } from "../utils/dates"
import { CalendarGrid } from "../components/calendar_grid"
import { GetUsers } from "../routes/users"
import { GetAvailability } from "../routes/availiability"
import { GetCategories } from "../routes/categories"
import { AddAbsenceDialog } from "../components/add_absence_dialog"

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
const SNAPSHOT_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export const CalendarPage = ({ token, currentUser, onLogout }) => {
    const [viewMode, setViewMode] = useState('month')
    const [search, setSearch] = useState('all')
    const [team, setTeam] = useState('all')
    const [statusFilter, setStatusFitler] = useState('all')
    const [staff, setStaff] = useState([])
    const [usersError, setUsersError] = useState('')
    const [availability, setAvailability] = useState([])
    const [categories, setCategories] = useState([])
    const [calendarDataError, setCalendarDataError] = useState('')
    const [calendarRefresh, setCalendarRefresh] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))

    const year = cursor.getFullYear()
    const month = cursor.getMonth()

    const goToMonth = (delta) => {
        setCursor(new Date(year, month + delta, 1))
    }

    const goToToday = () => {
        setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))
    }

    const handleExportCalendar = () => {

    }

    useEffect(() => {
        let active = true
        GetUsers(token)
            .then(users => {
                if (active) setStaff(users)
            })
            .catch(error => {
                if (active) setUsersError(error.message)
            })

        return () => {
            active = false
        }
    }, [token])

    useEffect(() => {
        let active = true
        Promise.all([GetAvailability(token), GetCategories()])
            .then(([entries, categoryList]) => {
                if (!active) return
                setAvailability(entries)
                setCategories(categoryList)
                setCalendarDataError('')
            })
            .catch(error => {
                if (active) setCalendarDataError(`Could not load calendar data: ${error.message}`)
            })

        return () => {
            active = false
        }
    }, [token, calendarRefresh])

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 3, md: 5 } }}>
            <Container maxWidth="lg">
                <CalendarHeader onExport={handleExportCalendar} onAddAbsence={() => setDialogOpen(true)} currentUser={currentUser} onLogout={onLogout}/>
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
                <Paper variant="outlined" sx={{ borderColor: 'divider', mt: { xs: 4, md: 5 } }}>
                    <Box sx={{ p: { xs: 2, md: 3 } }}>
                        <CalendarToolbar monthLabel={MONTH_FORMATTER.format(cursor)} onPreviousMonth={() => goToMonth(-1)} onNextMonth={() => goToMonth(1)} onToday={goToToday} viewMode={viewMode} onViewModeChange={setViewMode} search={search} onSearchChange={setSearch} team={team} onTeamChange={setTeam} statusFilter={statusFilter} onStatusFilterChange={setStatusFitler} staffCount={staff.length} />
                    </Box>
                    {usersError && <Typography color="error" role="alert">Could not load users: {usersError}</Typography>}
                    {calendarDataError && <Typography color="error" role="alert">{calendarDataError}</Typography>}
                    <Divider />
                    <CalendarGrid year={year} month={month} today={TODAY} staff={staff} availability={availability} categories={categories}/>
                </Paper>
                <AddAbsenceDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onCreated={() => setCalendarRefresh((refresh) => refresh + 1)}
                    staff={staff}
                    currentUser={currentUser}
                    token={token}
                />
            </Container>
        </Box>
    )
}