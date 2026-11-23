const now = new Date()

export const TODAY = new Date(
    now.getFullYear(), now.getMonth(), now.getDate()
)

export const isWeekend = (date) => {
    const day = date.getDay()
    return day === 0 || day === 6
}

export const daysInMonth = (year, month) => {
    const total = new Date(year, month + 1, 0).getDate()
    return Array.from({length: total}, (_, i) => new Date(year, month, i + 1))
}

export const daysInWeek = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())
    return Array.from(
        { length: 7 },
        (_, index) => new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + index)
    )
}

export const isSameDay = (a, b) => {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}