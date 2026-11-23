export const getTodaySnapshot = ({ staff, availability, categories, today }) => {
    const activeStaff = staff.filter((user) => user.is_active)
    const activeUserIds = new Set(activeStaff.map((user) => user.id))
    const categoryById = new Map(categories.map((category) => [category.id, category]))
    const userCategories = new Map()
    const todayKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-')

    availability.forEach((entry) => {
        if (
            !activeUserIds.has(entry.user_id) ||
            entry.start_date > todayKey ||
            entry.end_date < todayKey
        ) {
            return
        }

        const category = categoryById.get(entry.category_id)
        const categoriesForUser = userCategories.get(entry.user_id) || new Set()
        categoriesForUser.add(category?.code?.toUpperCase() || 'OTHER')
        userCategories.set(entry.user_id, categoriesForUser)
    })

    let remoteCount = 0
    let absentCount = 0
    let annualLeaveCount = 0
    let sickCount = 0

    activeStaff.forEach((user) => {
        const userCodes = userCategories.get(user.id) || new Set()
        const hasLeave = [...userCodes].some((code) => code !== 'OOO')
        const isRemote = userCodes.has('OOO')

        if (hasLeave) absentCount += 1
        else if (isRemote) remoteCount += 1

        if (userCodes.has('AL')) annualLeaveCount += 1
        if (userCodes.has('SL')) sickCount += 1
    })

    const inOfficeCount = activeStaff.length - absentCount - remoteCount

    return {
        totalStaff: activeStaff.length,
        presentCount: inOfficeCount + remoteCount,
        inOfficeCount,
        remoteCount,
        absentCount,
        annualLeaveCount,
        sickCount
    }
}
