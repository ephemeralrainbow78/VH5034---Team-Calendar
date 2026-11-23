export const exportCalendarToExcel = async ({
    year,
    month,
    days,
    viewMode,
    staff,
    availability,
    categories,
    today
}) => {
    const { default: ExcelJS } = await import('exceljs')
    const daysToDate = days.filter((day) => day <= today)
    const monthStart = days[0]
    const monthEnd = days[days.length - 1]
    const dateKey = (date) => [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-')
    const availabilityByCell = new Map()

    availability.forEach((entry) => {
        const startDate = new Date(`${entry.start_date}T00:00:00`)
        const endDate = new Date(`${entry.end_date}T00:00:00`)
        if (endDate < monthStart || startDate > monthEnd) return
        const date = new Date(Math.max(startDate.getTime(), monthStart.getTime()))
        const clippedEnd = new Date(Math.min(endDate.getTime(), monthEnd.getTime()))

        while (date <= clippedEnd) {
            const key = `${entry.user_id}:${dateKey(date)}`
            if (!availabilityByCell.has(key)) availabilityByCell.set(key, entry)
            date.setDate(date.getDate() + 1)
        }
    })

    const categoriesById = new Map(categories.map((category) => [category.id, category]))
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Calendar')
    worksheet.columns = [
        { header: 'Staff member', width: 26 },
        { header: 'Team', width: 20 },
        ...days.map((day) => ({
            header: new Intl.DateTimeFormat('en-GB', {
                weekday: 'short',
                day: 'numeric'
            }).format(day),
            width: 15
        })),
        { header: viewMode === 'week' ? 'Week to date' : 'Days in to date', width: 18 }
    ]

    staff.forEach((user) => {
        const cells = days.map((day) => {
            const entry = availabilityByCell.get(`${user.id}:${dateKey(day)}`)
            return entry
                ? categoriesById.get(entry.category_id)?.name || 'Absence'
                : ''
        })
        const unbookedDays = daysToDate.filter((day) => (
            !availabilityByCell.has(`${user.id}:${dateKey(day)}`)
        )).length
        worksheet.addRow([
            `${user.first_name} ${user.last_name}`,
            user.team || '',
            ...cells,
            daysToDate.length ? `${unbookedDays} / ${daysToDate.length}` : ''
        ])
    })

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF53656B' }
    }
    worksheet.views = [{ state: 'frozen', xSplit: 2, ySplit: 1 }]
    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: worksheet.columnCount }
    }

    const fileName = viewMode === 'week'
        ? `team-calendar-week-${dateKey(days[0])}.xlsx`
        : `team-calendar-${year}-${String(month + 1).padStart(2, '0')}.xlsx`
    const content = await workbook.xlsx.writeBuffer()
    const url = window.URL.createObjectURL(new Blob([content], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }))
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    downloadLink.download = fileName
    document.body.appendChild(downloadLink)
    downloadLink.click()
    downloadLink.remove()
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0)
}
