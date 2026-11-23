const pad = (value) => String(value).padStart(2, '0')

export const filterCalendarStaff = ({
    staff,
    availability,
    categories,
    search,
    team,
    statusFilter,
    year,
    month
}) => {
    const searchTerm = search.trim().toLocaleLowerCase()
    const selectedTeam = team.toLocaleLowerCase()
    const selectedStatus = statusFilter.toLocaleLowerCase()
    const matchingCategoryIds = new Set(
        categories
            .filter((category) => category.name.trim().toLocaleLowerCase() === selectedStatus)
            .map((category) => category.id)
    )
    const monthStart = `${year}-${pad(month + 1)}-01`
    const monthEnd = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`
    const staffWithStatus = new Set(
        availability
            .filter((entry) => (
                matchingCategoryIds.has(entry.category_id) &&
                entry.start_date <= monthEnd &&
                entry.end_date >= monthStart
            ))
            .map((entry) => entry.user_id)
    )

    return staff.filter((user) => {
        const searchableText = `${user.first_name} ${user.last_name} ${user.username}`
            .toLocaleLowerCase()

        return (
            (!searchTerm || searchableText.includes(searchTerm)) &&
            (selectedTeam === 'all' || user.team?.toLocaleLowerCase() === selectedTeam) &&
            (selectedStatus === 'all' || staffWithStatus.has(user.id))
        )
    })
}
