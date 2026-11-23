import { Add, ChevronLeft, ChevronRight, GroupOutlined, Search, Tune } from "@mui/icons-material"
import { Box, Button, IconButton, InputAdornment, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { GetTeams } from "../routes/team"

export const CalendarToolbar = ({ monthLabel, onPreviousMonth, onNextMonth, onToday, viewMode, onViewModeChange, search, onSearchChange, team, onTeamChange, statusFilter, onStatusFilterChange, staffCount, categories = [], isAdmin, onAddCategory }) => {
    const [teams, setTeams] = useState([])
    const [error, setError] = useState('')

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
                    <IconButton size="small" onClick={onPreviousMonth} aria-label="Previous month">
                        <ChevronLeft fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={onNextMonth} aria-label="Next month">
                        <ChevronRight fontSize="small" />
                    </IconButton>
                    <Button size="small" variant="outlined" color="inherit" onClick={onToday} sx={{ borderCOlor: '#d8d7d3', color: 'text.primary' }}>Today</Button>
                </Stack>
                <ToggleButtonGroup size="small" exclusive value={viewMode} onChange={(_e, value) => value && onViewModeChange(value)}>
                    <ToggleButton value="month">Month</ToggleButton>
                    <ToggleButton value="Week">Week</ToggleButton>
                </ToggleButtonGroup>
            </Stack>
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
                        <MenuItem key={f.value} value={f.value}>
                            {f.value}
                        </MenuItem>
                    ))}
                </TextField>
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
                <Box sx={{flex: 1}} />
                {Number.isFinite(staffCount) && (
                    <Typography variant="body2" color="text.secondary">
                        {staffCount} staff member{staffCount === 1 ? '' : 's'}
                    </Typography>
                )}
                <IconButton size="small" aria-label="More options">
                    <Tune fontSize="small"/>
                </IconButton>
            </Stack>
        </Stack>
    )
}