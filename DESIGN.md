# Dashboard design guidelines

## Layout and spacing

- Use an 8 px spacing grid. Apply 16 px at the workspace perimeter and inside cards. Apply 8 px between adjacent tiles and between Summary rows and columns. Use 16 px between groups when they need more separation.
- Keep the prototype in a responsive 16:9 landscape frame. The workspace contains a vertically scrollable sidebar and a content area.
- On Summary, keep OER and Play Audio in equal-width columns. Size their row to the content and let the MPG panel take the remaining height. Scale the dial within its panel so the three cards fit in the available height.
- Use the same yellow selection bar across sidebar tiles. Align card edges to the grid and center controls within their cards.

## Color

| Role | Value |
| --- | --- |
| Canvas outside the dashboard | `#0c0d11` |
| Workspace | `#191b24` |
| Driver header | `#22252e` |
| Sidebar tiles and Summary cards | `#333543` |
| Primary text | `#fafbfc` |
| Selection and turn guidance | `#ffce00` |
| Notification badge | `#ffbf00` |
| Audio control | `#056295` |

## Typography and hierarchy

- Use Roboto with Arial and sans-serif fallbacks. Size dashboard labels relative to the frame so they scale for landscape previews.
- Give the primary reading or instruction the largest type. Use bold uppercase for sidebar labels and units. Keep explanatory text and secondary readings subordinate to the primary reading.
- Use vector icons on transparent backgrounds. Keep yellow for active states, notifications, and turn guidance.
