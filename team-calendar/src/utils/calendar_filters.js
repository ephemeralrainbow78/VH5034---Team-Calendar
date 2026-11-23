export const filterCalendarStaff = ({
    staff,
    availability,
    categories,
    search,
    team,
    statusFilter,
    rangeStart,
    rangeEnd
}) => {
    const searchTerm = search.trim().toLocaleLowerCase()
    const selectedTeam = team.toLocaleLowerCase()
    const selectedStatus = statusFilter.toLocaleLowerCase()
    const matchingCategoryIds = new Set(
        categories
            .filter((category) => category.name.trim().toLocaleLowerCase() === selectedStatus)
            .map((category) => category.id)
    )
    const staffWithStatus = new Set(
        availability
            .filter((entry) => (
                matchingCategoryIds.has(entry.category_id) &&
                entry.start_date <= rangeEnd &&
                entry.end_date >= rangeStart
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
