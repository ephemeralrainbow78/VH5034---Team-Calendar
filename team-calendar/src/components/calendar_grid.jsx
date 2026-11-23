import { Check, SortByAlpha } from "@mui/icons-material";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { daysInMonth, isSameDay, isWeekend } from "../utils/dates";

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const dateKey = (date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
].join('-')

const getAvailabilityByCell = (availability) => {
    const byCell = new Map()
    availability.forEach((entry) => {
        const date = new Date(`${entry.start_date}T00:00:00`)
        const endDate = new Date(`${entry.end_date}T00:00:00`)
        while (date <= endDate) {
            const key = `${entry.user_id}:${dateKey(date)}`
            if (!byCell.has(key)) byCell.set(key, entry)
            date.setDate(date.getDate() + 1)
        }
    })
    return byCell
}

export const CalendarGrid = ({ year, month, today, staff = [], availability = [], categories = [] }) => {
    const [sortDirection, setSortDirection] = useState(null)
    const days = daysInMonth(year, month)
    const daysToDate = days.filter((day) => day <= today)
    const availabilityByCell = getAvailabilityByCell(availability)
    const categoriesById = new Map(categories.map((category) => [category.id, category]))
    const sortedStaff = sortDirection
        ? [...staff].sort((first, second) => {
            const firstName = `${first.first_name} ${first.last_name}`
            const secondName = `${second.first_name} ${second.last_name}`
            const comparison = firstName.localeCompare(secondName, 'en', { sensitivity: 'base' })
            return sortDirection === 'asc' ? comparison : -comparison
        })
        : staff

    return (
        <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: `320px repeat(${days.length}, 34px) 110px`, minWidth: 430 + days.length * 34 }}>
                <Box sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2, px: 2, py: 2, borderBottom: '1px solid', borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Staff member
                        </Typography>
                        <IconButton
                            size="small"
                            aria-label={sortDirection === 'asc' ? 'Sort staff Z to A' : 'Sort staff A to Z'}
                            onClick={() => setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc')}
                        >
                            <SortByAlpha
                                fontSize="small"
                                color="action"
                                sx={{ transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none' }}
                            />
                        </IconButton>
                    </Box>
                </Box>
                {days.map((d) => {
                    const todayColumns = isSameDay(d, today)
                    return (
                        <Box key={d.toISOString()} sx={{ textAlign: 'center', py: 1, borderBottom: '1px solid', borderRight: '1px solid', borderColor: 'divider', bgcolor: todayColumns ? '#eaf6ef' : isWeekend(d) ? '#fafaf8' : 'transparent' }}>
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: 10, lineHeight: 1.4 }}>
                                {DAY_LABELS[d.getDay()]}
                            </Typography>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', fontSize: 12, fontWeight: 700, bgcolor: todayColumns ? 'primary.main' : 'transparent', color: todayColumns ? 'primary.contrastText' : 'text.priamry' }}>
                                {d.getDate()}
                            </Box>
                        </Box>
                    )
                })}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1, borderBottom: '1px solid', borderLeft: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Days in
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        to date
                    </Typography>
                </Box>
                {sortedStaff.length === 0 && (
                    <Box sx={{ gridColumn: '1 / -1', px: 2, py: 3 }}>
                        <Typography color="text.secondary" role="status">
                            No staff match the selected filters.
                        </Typography>
                    </Box>
                )}
                {sortedStaff.map((user) => (
                    <StaffRow
                        key={user.id}
                        user={user}
                        days={days}
                        daysToDate={daysToDate}
                        today={today}
                        availabilityByCell={availabilityByCell}
                        categoriesById={categoriesById}
                    />
                ))}
            </Box>
        </Box>
    )
}

const StaffRow = ({ user, days, daysToDate, today, availabilityByCell, categoriesById }) => {
    const unbookedDays = daysToDate.filter((day) => (
        !availabilityByCell.has(`${user.id}:${dateKey(day)}`)
    )).length

    return (
        <>
            <Box sx={{ position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper', px: 2, py: 1.5, minHeight: 64, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 1.75, borderBottom: '1px solid', borderRight: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', bgcolor: '#e8eeee', color: '#718187', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>
                    {`${user.first_name[0]}${user.last_name[0]}`.toUpperCase()}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.3 }} noWrap>
                        {user.first_name} {user.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {user.team}
                    </Typography>
                </Box>
            </Box>
            {days.map((day) => {
                const entry = availabilityByCell.get(`${user.id}:${dateKey(day)}`)
                const category = entry ? categoriesById.get(entry.category_id) : null
                const marker = category?.code === 'OOO' ? 'R' : category?.code

                return (
                    <Box
                        key={`${user.id}-${dateKey(day)}`}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 38,
                            borderBottom: '1px solid',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                            bgcolor: isSameDay(day, today) ? '#eaf6ef' : isWeekend(day) ? '#fafaf8' : 'transparent'
                        }}
                    >
                        {entry && (
                            <Tooltip title={`${category?.name || 'Absence'}: ${entry.start_date} to ${entry.end_date}`}>
                                <Box
                                    aria-label={`${category?.name || 'Absence'} for ${user.first_name} ${user.last_name}`}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 24,
                                        height: 26,
                                        borderRadius: 1,
                                        bgcolor: category?.colour || '#e8effc',
                                        color: 'text.secondary',
                                        fontSize: marker?.length > 2 ? 8 : 10,
                                        fontWeight: 700
                                    }}
                                >
                                    {marker || 'A'}
                                </Box>
                            </Tooltip>
                        )}
                        {!entry && day <= today && <Check aria-label="No absence booked" sx={{ fontSize: 16, color: '#12825a' }} />}
                    </Box>
                )
            })}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid', borderLeft: '1px solid', borderColor: 'divider' }}>
                {daysToDate.length > 0 && (
                    <>
                        <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {unbookedDays}
                        </Typography>
                        <Typography component="span" variant="body2" sx={{ color: 'text.disabled' }}>
                            {' / '}{daysToDate.length}
                        </Typography>
                    </>
                )}
            </Box>
        </>
    )
}