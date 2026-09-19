# Test Resource Manifest

RuleMesh does not depend on an external web resource. The canonical resources are
the immutable `Rule` records created on-chain and bound to a sealed policy snapshot.

| Resource | Purpose | Authority | Binding | Expected result |
|---|---|---|---|---|
| Treasury threshold pair | positive | authenticated policy owner | set ID, rule IDs, rule digests, snapshot digest | COMPATIBLE → READY |
| Approval exception pair | conflict | authenticated policy owner | same bindings | CONFLICT → CONFLICTED |
| Ambiguous pair | safe failure | authenticated policy owner | same bindings | UNCLEAR → CONFLICTED |

Expected results are defined before validator execution. Direct Mode changes one
semantic result at a time. After deployment the same fixtures must be replayed on the
exact StudioNet address with transaction finality and authoritative state readback.
