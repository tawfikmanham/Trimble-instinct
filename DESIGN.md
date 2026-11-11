# Dashboard design guidelines

## Layout and spacing

- Use an 8 px spacing grid. Apply 16 px inside cards and 8 px around the content area beside the side rail. Apply 8 px between adjacent tiles and between Summary rows and columns. Use 16 px between groups when they need more separation.
- Keep the prototype in a responsive 16:9 landscape frame. The compact app bar occupies about 14% of the frame height. The side rail uses about 9% of the frame width and divides its height equally among Home, HOS, and Navigation.
- On Home, keep OER and Play Audio in equal-width columns. Size their row to the content and let the MPG panel take the remaining height. Scale the dial within its panel so the three cards fit in the available height.
- Use amber for the selected rail icon and label, with muted grey for inactive items. Align card edges to the grid and center controls within their cards.
- Keep sidebar tiles and dashboard cards square-cornered, including the HOS panel and Play Audio card. Use incoming references for content and arrangement while keeping the established dashboard shape and spacing. Circular controls, badges, and gauges retain their functional shapes.
- Use square corners and no perimeter border on the Choose Status dialog. Use the dim backdrop to separate it from the dashboard and keep visible keyboard focus on its controls.

## App bar

- Show remaining driving time on the left and link it to HOS. Use the same sample value in both places.
- Group the red incident-recording control and driver profile on the right. The record control simulates start and stop for the prototype.
- Attach the duty badge to the avatar and open Choose Status from the profile control. Use the full status name in its accessible label.

## Color

| Role | Value |
| --- | --- |
| Canvas outside the dashboard | `#0c0d11` |
| Workspace | `#191b24` |
| Driver header | `#242432` |
| Sidebar tiles and Summary cards | `#333543` |
| Primary text | `#fafbfc` |
| Side rail selection | `#ffb126` |
| Turn guidance | `#ffce00` |
| Notification badge | `#ffbf00` |
| Audio control | `#056295` |

## Typography and hierarchy

- Use Roboto with Arial and sans-serif fallbacks. Size dashboard labels relative to the frame so they scale for landscape previews.
- Give the primary reading or instruction the largest type. Use short, readable rail labels and uppercase units. Keep explanatory text and secondary readings subordinate to the primary reading.
- Use [Material Symbols Outlined](https://developers.google.com/fonts/docs/material_symbols) from Google Fonts for UI icons. Add new icon names to the alphabetized font subset in `index.html` and set fill and size through the shared icon style. Keep yellow for active states, notifications, and turn guidance.
- The audio morph uses the Material play and pause silhouettes as its endpoints. The map and region flag are artwork.

## Motion

- Keep frequently repeated feedback short. The audio button compresses slightly on press and morphs between play and pause in 150 ms with ease-in-out.
- Keep timer digits in fixed-width cells. Roll only the digits that change, using the same direction and timing on each tick. Reset the timer immediately on replay.
- Respect reduced motion by updating icons and digits immediately.
- References [Emil Kowalski’s animation tips](https://emilkowal.ski/ui/7-practical-animation-tips) and [guidance on easing and duration](https://emilkowal.ski/ui/agents-with-taste).
