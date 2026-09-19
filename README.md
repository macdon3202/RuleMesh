# RuleMesh

RuleMesh is a GenLayer dApp that builds an on-chain semantic conflict graph for
natural-language policy rules. Rules are immutable contract state; validators compare
each sealed pair, while deterministic logic controls graph completeness, resolution,
snapshot binding, activation, and supersession.

## Architecture difference

RuleMesh has no external web evidence, registry lookup, repository diff, escrow, or
one-shot audit verdict. Its canonical evidence is immutable on-chain rule state. It
persists pairwise graph edges and only activates a complete, resolved snapshot.

## Local verification

```text
python -m pytest -q
python -X utf8 -m genvm_linter.cli check contracts/rule_mesh.py
cd frontend && npm test && npm run build
```

## StudioNet deployment

- Contract: `0xfDb24153538249946f23a166485958493bf98420`
- Version guard: `RULE_MESH_V1`
- [Explorer](https://explorer-studio.genlayer.com/address/0xfDb24153538249946f23a166485958493bf98420)
- [Full live E2E evidence](docs/STUDIONET_E2E.md)

The production frontend is pinned to this deployment via `.env.production`.
