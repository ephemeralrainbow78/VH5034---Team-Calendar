import { Stack, Typography } from "@mui/material"
import { SnapshotCard } from "./snapshot_card"
import { PersonOffOutlined, PersonOutlineOutlined } from "@mui/icons-material"

export const SnapshotCards = ({
    presentCount,
    totalStaff,
    inOfficeCount,
    remoteCount,
    absentCount,
    annualLeaveCount,
    sickCount,
    isLoading,
    hasError
}) => {
    const unavailable = hasError || isLoading

    return (
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <SnapshotCard icon={<PersonOutlineOutlined fontSize="small" />} title="Present Today" value={<>
                {unavailable ? '—' : presentCount}
                {!unavailable && <Typography component="span" variant="h6" sx={{ color: 'text.secondary' }}> / {totalStaff}</Typography>}
            </>
            }
                caption={unavailable ? (hasError ? 'Calendar data unavailable' : 'Loading attendance…') : `${inOfficeCount} in office · ${remoteCount} remote`}
            />
            <SnapshotCard
                icon={<PersonOffOutlined fontSize="small" />}
                title="Absent Today"
                value={unavailable ? '—' : absentCount}
                caption={unavailable ? (hasError ? 'Calendar data unavailable' : 'Loading attendance…') : `${annualLeaveCount} annual leave · ${sickCount} sick`}
            />

        </Stack>
    )
}