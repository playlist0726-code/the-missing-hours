# Project 6 validation

Checked October 29, 2026.

## Automated rules

`npm test`: 7/7 tests passed. Covers starting state, separate resets, bounds, weighted scores, tied impacts, timeout preservation, legal cut sequences, clock formatting, and Easy/Normal/Hard goals with undo and timeout.

## Browser checks

Tested with headless Google Chrome in a fresh isolated browser context, without an authenticated GitHub session.

- All three difficulty modes complete at their own goals.
- Hour-token DOM count changes from 24 to 24 minus journey hours and increases on undo.
- Undo disables completion until the goal is restored.
- Milestone text appears at the goal.
- Results show the selected journey length and reset returns to the introduction.
- Hard-mode real timeout preserves the existing cut and allocates exactly four total hours.
- Sound toggle updates its pressed state; audio and font files serve successfully.
- Desktop (1440 px), tablet (768 px), and mobile (375 px) layouts checked; no horizontal overflow.
- No JavaScript page errors during these interactions.

Screenshots in this directory show the final version. The private submission PDF includes the live GitHub Pages URL and all written answers.
