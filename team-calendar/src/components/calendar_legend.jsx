import { Check } from "@mui/icons-material"
import { Box, Stack, Typography } from "@mui/material"

export const CalendarLegend = ({ categories = [] }) => (
    <Box
        role="group"
        aria-label="Calendar legend"
        sx={{ px: { xs: 2, md: 3 }, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
    >
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", alignItems: "center", rowGap: 1.25 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                Legend
            </Typography>
            {categories.map((category) => {
                const marker = category.code === "OOO" ? "R" : category.code || "A"
                return (
                    <Stack key={category.id} direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <Box
                            aria-hidden="true"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 24,
                                height: 26,
                                borderRadius: 1,
                                bgcolor: category.colour || "#e8effc",
                                color: "text.secondary",
                                fontSize: marker.length > 2 ? 8 : 10,
                                fontWeight: 700
                            }}
                        >
                            {marker}
                        </Box>
                        <Typography variant="caption">{category.name}</Typography>
                    </Stack>
                )
            })}
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                <Check aria-hidden="true" sx={{ fontSize: 16, color: "#12825a" }} />
                <Typography variant="caption">No absence booked (past days)</Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <Box aria-hidden="true" sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#eaf6ef" }} />
                <Typography variant="caption">Today</Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <Box aria-hidden="true" sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#fafaf8", border: "1px solid", borderColor: "divider" }} />
                <Typography variant="caption">Weekend</Typography>
            </Stack>
        </Stack>
    </Box>
)
