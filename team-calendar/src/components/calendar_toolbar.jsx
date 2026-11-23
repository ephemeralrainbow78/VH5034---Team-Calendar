import { Add, ChevronLeft, ChevronRight, GroupOutlined, Search, Tune } from "@mui/icons-material"
import { Badge, Box, Button, Collapse, IconButton, InputAdornment, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { GetTeams } from "../routes/team"

export const CalendarToolbar = ({ monthLabel, onPreviousMonth, onNextMonth, onToday, viewMode, onViewModeChange, search, onSearchChange, team, onTeamChange, statusFilter, onStatusFilterChange, staffCount, categories = [], isAdmin, onAddCategory }) => {
    const [teams, setTeams] = useState([])
    const [error, setError] = useState('')
    const [filtersOpen, setFiltersOpen] = useState(true)
    const activeFilterCount = Number(Boolean(search.trim())) + Number(team !== 'all') + Number(statusFilter !== 'all')

    useEffect(() => {
        let cancelled = false
        GetTeams().then(teamRequest => {
            if (!cancelled) setTeams(teamRequest.map((team) => ({
                value: team.name,
                label: team.name
            })))
        }).catch(error => {
            if (!cancelled) {
                setError(`Could not load calendar filters: ${error.message}`)
            }
        })

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <Stack spacing={2}>
            {error && <Typography color="error" role="alert">{error}</Typography>}
            <Stack direction="row" sx={{ flexWrap: 'wrap', rowGap: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" space={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="h6">{monthLabel}</Typography>
                    <IconButton size="small" onClick={onPreviousMonth} aria-label={`Previous ${viewMode}`}>
                        <ChevronLeft fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={onNextMonth} aria-label={`Next ${viewMode}`}>
                        <ChevronRight fontSize="small" />
                    </IconButton>
                    <Button size="small" variant="outlined" color="inherit" onClick={onToday} sx={{ borderCOlor: '#d8d7d3', color: 'text.primary' }}>Today</Button>
                </Stack>
                <ToggleButtonGroup size="small" exclusive value={viewMode} onChange={(_e, value) => value && onViewModeChange(value)}>
                    <ToggleButton value="month">Month</ToggleButton>
                    <ToggleButton value="week">Week</ToggleButton>
                </ToggleButtonGroup>
            </Stack>
            <Collapse in={filtersOpen} unmountOnExit>
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5, alignItems: 'center' }}>
                <TextField size="small" placeholder="Search Staff" value={search} onChange={(e) => onSearchChange(e.target.value)} sx={{ minWidth: 220, flex: '1 1 220px' }} slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        )
                    }
                }}
                />
                <TextField size="small" select value={team} onChange={(e) => onTeamChange(e.target.value)} sx={{ minWidth: 160 }} slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <GroupOutlined fontSize="small" />
                            </InputAdornment>
                        )
                    }
                }}
                >
                    <MenuItem value="all"> All teams</MenuItem>
                    {teams.map((t) => (
                        <MenuItem key={t.label} value={t.value}>
                            {t.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField size="small" select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} sx={{ minWidth: 160 }} >
                    <MenuItem value="all"> All Statuses</MenuItem>
                    {categories.map((f) => (
                        <MenuItem key={f.id} value={f.name}>
                            {f.name}
                        </MenuItem>
                    ))}
                </TextField>
                </Stack>
            </Collapse>
            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                {isAdmin && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={onAddCategory}
                    >
                        Add absence category
                    </Button>
                )}
                <Box sx={{ flex: 1 }} />
                {Number.isFinite(staffCount) && (
                    <Typography variant="body2" color="text.secondary">
                        {staffCount} staff member{staffCount === 1 ? '' : 's'}
                    </Typography>
                )}
                <Tooltip title={filtersOpen ? 'Hide filters' : 'Show filters'}>
                    <IconButton
                        size="small"
                        aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}
                        aria-expanded={filtersOpen}
                        onClick={() => setFiltersOpen((open) => !open)}
                    >
                        <Badge badgeContent={activeFilterCount} color="primary" invisible={activeFilterCount === 0}>
                            <Tune fontSize="small" />
                        </Badge>
                    </IconButton>
                </Tooltip>
            </Stack>
        </Stack>
    )
}