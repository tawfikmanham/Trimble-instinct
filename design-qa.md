# Navigation baseline QA

The source is the attached Android screenshot at 2696 × 1792 pixels. The app-owned comparison area is 2558 × 1408 pixels, from the driver status bar through the bottom of the turn guidance. The target is the stopped state with the turn preview closed.

The screenshot supplies the map and the original icon artwork. The browser implementation uses HTML text, CSS layout, and a disclosure button for the guidance. The local asset and JavaScript checks passed, including opening, closing, and Escape. The local HTTP listener was denied by the execution sandbox, and the in-app browser rejected the file URL. A browser capture, visual comparison, and touch-device check remain pending.

final result: blocked
