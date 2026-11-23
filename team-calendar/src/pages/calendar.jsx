import { Alert, Box, Container, Divider, Paper, Stack, Typography } from "@mui/material"
import { CalendarHeader } from "../components/calendar_header"
import { SnapshotCards } from "../components/snapshot_cards"
import { CalendarToolbar } from "../components/calendar_toolbar"
import { useEffect, useMemo, useState } from "react"
import { TODAY } from "../utils/dates"
import { exportCalendarToExcel } from "../utils/calendar_export"
import { getTodaySnapshot } from "../utils/calendar_snapshot"
import { filterCalendarStaff } from "../utils/calendar_filters"
import { CalendarGrid } from "../components/calendar_grid"
import { GetUsers } from "../routes/users"
import { GetAvailability } from "../routes/availiability"
import { GetCategories } from "../routes/categories"
import { AddAbsenceDialog } from "../components/add_absence_dialog"

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
const SNAPSHOT_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export const CalendarPage = ({ token, currentUser, onLogout }) => {
    const [viewMode, setViewMode] = useState('month')
    const [search, setSearch] = useState('')
    const [team, setTeam] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [staff, setStaff] = useState([])
    const [usersLoaded, setUsersLoaded] = useState(false)
    const [usersError, setUsersError] = useState('')
    const [availability, setAvailability] = useState([])
    const [categories, setCategories] = useState([])
    const [loadedCalendarRefresh, setLoadedCalendarRefresh] = useState(null)
    const [calendarDataError, setCalendarDataError] = useState('')
    const [calendarExportError, setCalendarExportError] = useState('')
    const [calendarRefresh, setCalendarRefresh] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))

    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const snapshot = useMemo(
        () => getTodaySnapshot({ staff, availability, categories, today: TODAY }),
        [staff, availability, categories]
    )
    const filteredStaff = useMemo(
        () => filterCalendarStaff({
            staff,
            availability,
            categories,
            search,
            team,
            statusFilter,
            year,
            month
        }),
        [staff, availability, categories, search, team, statusFilter, year, month]
    )
    const snapshotLoading = !usersLoaded || loadedCalendarRefresh !== calendarRefresh
    const snapshotUnavailable = Boolean(usersError || calendarDataError)

    const goToMonth = (delta) => {
        setCursor(new Date(year, month + delta, 1))
    }

    const goToToday = () => {
        setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))
    }

    const handleExportCalendar = async () => {
        setCalendarExportError('')
        try {
            await exportCalendarToExcel({
                year,
                month,
                staff: filteredStaff,
                availability,
                categories,
                today: TODAY
            })
        } catch (error) {
            setCalendarExportError(`Could not export the calendar: ${error.message}`)
        }
    }

    useEffect(() => {
        let active = true
        GetUsers(token)
            .then(users => {
                if (!active) return
                setStaff(users)
                setUsersError('')
            })
            .catch(error => {
                if (active) setUsersError(error.message)
            })
            .finally(() => {
                if (active) setUsersLoaded(true)
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
            .finally(() => {
                if (active) setLoadedCalendarRefresh(calendarRefresh)
            })

        return () => {
            active = false
        }
    }, [token, calendarRefresh])

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 3, md: 5 } }}>
            <Container maxWidth="lg">
                <CalendarHeader
                    onExport={handleExportCalendar}
                    exportDisabled={!usersLoaded || loadedCalendarRefresh !== calendarRefresh || Boolean(usersError || calendarDataError)}
                    onAddAbsence={() => setDialogOpen(true)}
                    currentUser={currentUser}
                    onLogout={onLogout}
                />
                {calendarExportError && <Alert severity="error" sx={{ mt: 2 }}>{calendarExportError}</Alert>}
                <Box>
                    <Stack direction='row' sx={{ flexWrap: 'wrap', mb: 1.5, justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            Today's Snapshot
                        </Typography>
                        <Typography variant="caption" color="text.seconday">
                            Last Synced at
                        </Typography>
                    </Stack>
                    <SnapshotCards
                        {...snapshot}
                        isLoading={snapshotLoading}
                        hasError={snapshotUnavailable}
                    />
                </Box>
                <Paper variant="outlined" sx={{ borderColor: 'divider', mt: { xs: 4, md: 5 } }}>
                    <Box sx={{ p: { xs: 2, md: 3 } }}>
                        <CalendarToolbar monthLabel={MONTH_FORMATTER.format(cursor)} onPreviousMonth={() => goToMonth(-1)} onNextMonth={() => goToMonth(1)} onToday={goToToday} viewMode={viewMode} onViewModeChange={setViewMode} search={search} onSearchChange={setSearch} team={team} onTeamChange={setTeam} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} staffCount={filteredStaff.length} />
                    </Box>
                    {usersError && <Typography color="error" role="alert">Could not load users: {usersError}</Typography>}
                    {calendarDataError && <Typography color="error" role="alert">{calendarDataError}</Typography>}
                    <Divider />
                    <CalendarGrid year={year} month={month} today={TODAY} staff={filteredStaff} availability={availability} categories={categories}/>
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