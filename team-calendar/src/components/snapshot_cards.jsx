import { Stack, Typography } from "@mui/material"
import { SnapshotCard } from "./snapshot_card"
import { PersonOffOutlined, PersonOutlineOutlined } from "@mui/icons-material"

export const SnapshotCards = ({ presentCount, totalStaff, inOfficeCount, remoteCount, absentCount, annualLeaveCount, sickCount, attendanceRate, attendanceDelta, pendingCount }) => {
    return (
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <SnapshotCard icon={<PersonOutlineOutlined fontSize="small" />} title="Present Today" value={<>
                {presentCount}
                <Typography component="span" variant="h6" sx={{ color: 'text.secondary' }}> / {totalStaff}</Typography>
            </>
            }
                caption={`${inOfficeCount} in office ${remoteCount} remote`}
            />
            <SnapshotCard icon={<PersonOffOutlined fontSize="small" />} title="Absent Today" value={absentCount} caption={`${annualLeaveCount} annual leave ${sickCount} sick`} />

        </Stack>
    )
}