import { Alert, Box, Container, Divider, Paper, Stack, Typography } from "@mui/material"
import { CalendarHeader } from "../components/calendar_header"
import { SnapshotCards } from "../components/snapshot_cards"
import { CalendarToolbar } from "../components/calendar_toolbar"
import { useEffect, useMemo, useState } from "react"
import { daysInMonth, daysInWeek, TODAY } from "../utils/dates"
import { exportCalendarToExcel } from "../utils/calendar_export"
import { getTodaySnapshot } from "../utils/calendar_snapshot"
import { filterCalendarStaff } from "../utils/calendar_filters"
import { CalendarGrid } from "../components/calendar_grid"
import { CalendarLegend } from "../components/calendar_legend"
import { GetUsers } from "../routes/users"
import { GetAvailability } from "../routes/availiability"
import { GetCategories } from "../routes/categories"
import { AddAbsenceDialog } from "../components/add_absence_dialog"
import { AddCategoryDialog } from "../components/add_category_dialog"

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
const WEEK_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const SYNC_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const SNAPSHOT_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const dateKey = (date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
].join('-')

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
    const [lastSyncedAt, setLastSyncedAt] = useState(null)
    const [calendarDataError, setCalendarDataError] = useState('')
    const [calendarExportError, setCalendarExportError] = useState('')
    const [calendarActionAlert, setCalendarActionAlert] = useState(null)
    const [calendarRefresh, setCalendarRefresh] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
    const [cursor, setCursor] = useState(TODAY)

    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const visibleDays = useMemo(
        () => viewMode === 'week' ? daysInWeek(cursor) : daysInMonth(year, month),
        [viewMode, cursor, year, month]
    )
    const rangeStart = dateKey(visibleDays[0])
    const rangeEnd = dateKey(visibleDays[visibleDays.length - 1])
    const periodLabel = viewMode === 'week'
        ? visibleDays[0].getMonth() === visibleDays[visibleDays.length - 1].getMonth()
            ? `${visibleDays[0].getDate()}-${visibleDays[visibleDays.length - 1].getDate()} ${MONTH_FORMATTER.format(visibleDays[visibleDays.length - 1])}`
            : `${WEEK_DATE_FORMATTER.format(visibleDays[0])} - ${WEEK_DATE_FORMATTER.format(visibleDays[visibleDays.length - 1])}`
        : MONTH_FORMATTER.format(cursor)
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
            rangeStart,
            rangeEnd
        }),
        [staff, availability, categories, search, team, statusFilter, rangeStart, rangeEnd]
    )
    const snapshotLoading = !usersLoaded || loadedCalendarRefresh !== calendarRefresh
    const snapshotUnavailable = Boolean(usersError || calendarDataError)

    const goToMonth = (delta) => {
        setCursor(new Date(year, month + delta, 1))
    }

    const goToToday = () => {
        setCursor(TODAY)
    }

    const goToWeek = (delta) => {
        setCursor((current) => {
            const nextDate = new Date(current)
            nextDate.setDate(nextDate.getDate() + delta * 7)
            return nextDate
        })
    }

    const goToPreviousPeriod = () => {
        if (viewMode === 'week') goToWeek(-1)
        else goToMonth(-1)
    }

    const goToNextPeriod = () => {
        if (viewMode === 'week') goToWeek(1)
        else goToMonth(1)
    }

    const handleExportCalendar = async () => {
        setCalendarExportError('')
        try {
            await exportCalendarToExcel({
                year,
                month,
                days: visibleDays,
                viewMode,
                staff: filteredStaff,
                availability,
                categories,
                today: TODAY
            })
        } catch (error) {
            setCalendarExportError(`Could not export the calendar: ${error.message}`)
        }
    }

    const handleCategoryCreated = (category) => {
        setCategories((current) => (
            [...current, category].sort((first, second) => (
                first.name.localeCompare(second.name, 'en', { sensitivity: 'base' })
            ))
        ))
        setCalendarActionAlert({
            severity: 'success',
            message: `${category.name} category created successfully.`
        })
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
                setLastSyncedAt(new Date())
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
                {calendarActionAlert && (
                    <Alert
                        severity={calendarActionAlert.severity}
                        sx={{ mt: 2 }}
                        onClose={() => setCalendarActionAlert(null)}
                    >
                        {calendarActionAlert.message}
                    </Alert>
                )}
                {calendarExportError && <Alert severity="error" sx={{ mt: 2 }}>{calendarExportError}</Alert>}
                <Box>
                    <Stack direction='row' sx={{ flexWrap: 'wrap', mb: 1.5, justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                Today's Snapshot · 
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {SNAPSHOT_DATE_FORMATTER.format(TODAY)}
                            </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            Last synced at {lastSyncedAt ? SYNC_TIME_FORMATTER.format(lastSyncedAt) : '—'}
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
                        <CalendarToolbar monthLabel={periodLabel} onPreviousMonth={goToPreviousPeriod} onNextMonth={goToNextPeriod} onToday={goToToday} viewMode={viewMode} onViewModeChange={setViewMode} search={search} onSearchChange={setSearch} team={team} onTeamChange={setTeam} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} staffCount={filteredStaff.length} categories={categories} isAdmin={currentUser?.role?.toLowerCase() === 'admin'} onAddCategory={() => setCategoryDialogOpen(true)} />
                    </Box>
                    {usersError && <Alert severity="error" sx={{ m: 2 }}>Could not load users: {usersError}</Alert>}
                    {calendarDataError && <Alert severity="error" sx={{ m: 2 }}>{calendarDataError}</Alert>}
                    <Divider />
                    <CalendarGrid year={year} month={month} today={TODAY} staff={filteredStaff} availability={availability} categories={categories} visibleDays={visibleDays} viewMode={viewMode}/>
                    <CalendarLegend categories={categories} />
                </Paper>
                <AddAbsenceDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onCreated={() => {
                        setCalendarRefresh((refresh) => refresh + 1)
                        setCalendarActionAlert({
                            severity: 'success',
                            message: 'Absence added successfully.'
                        })
                    }}
                    staff={staff}
                    currentUser={currentUser}
                    token={token}
                />
                <AddCategoryDialog
                    open={categoryDialogOpen}
                    onClose={() => setCategoryDialogOpen(false)}
                    onCreated={handleCategoryCreated}
                    token={token}
                />
            </Container>
        </Box>
    )
}