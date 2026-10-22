# Verification — October 22, 2026

## Automated rules

`npm test` passes six tests, covering the 24-hour initial total, independent resets, minimum activity hours, the three-hour cap, undo boundaries, weighted scoring, tied time tradeoffs, deterministic timeout completion, clock formatting, and all legal sequences through three cuts.

## Browser checks

Verified in a fresh, non-persistent Chrome browser context (no signed-in session):

- Start → review schedule → lock schedule → cut hours → results.
- Removing Meals reduces Health by 10 and disables further cuts at its minimum.
- Undo restores both hours and score.
- Sleep, Class, and Friends cuts produce an Impact Score of 268.
- Replay and Reset game restore initial state and controls.
- A virtual browser clock advances the real round through its 60-second deadline; existing cuts are preserved and the rest are assigned automatically.
- Every screen fits widths of 320, 375, 768, 1024, and 1440 pixels without horizontal overflow.
- Completion creates confetti; reduced-motion mode suppresses it.
- No uncaught JavaScript errors during the tested flows.

The screenshots in this folder show the desktop intro, gameplay, results, and mobile states. Live GitHub Pages availability is verified after publishing.

This is a student prototype. Full manual screen-reader testing and physical-device testing have not been performed.
