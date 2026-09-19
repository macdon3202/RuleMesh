# Architecture

Proof obligation: every unordered pair in a sealed policy snapshot must have a
consensus-bound semantic relation, and no unresolved conflict or uncertainty may be
hidden when the snapshot becomes active.

The model may classify scope and compatibility. It cannot add rules, resolve an edge,
activate a set, change priority, or supersede an active snapshot. These consequences
are enforced deterministically from stored graph counts and the sealed digest.
