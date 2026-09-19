# RuleMesh StudioNet E2E evidence

Verified on 2026-09-19 against deployment
[`0xfDb24153538249946f23a166485958493bf98420`](https://explorer-studio.genlayer.com/address/0xfDb24153538249946f23a166485958493bf98420).
The live `get_config()` version guard returned `RULE_MESH_V1` before any write.

## Compatible lifecycle

| Step | Final execution | Transaction |
|---|---|---|
| Create policy set | SUCCESS | [0x4de453…ac2a](https://explorer-studio.genlayer.com/tx/0x4de453462a464ae75a62f931ca21ee19b02fc8d99436e32304e713249100ac2a) |
| Add public-docs rule | SUCCESS | [0xa4dfa6…0a3a](https://explorer-studio.genlayer.com/tx/0xa4dfa65e350a0f8a318a76ccd04a3da2df8ad0afb9ed499e53c66446fa0d0a3a) |
| Add treasury rule | SUCCESS | [0x5bf2f9…3df1](https://explorer-studio.genlayer.com/tx/0x5bf2f942e999acbd1831d80633a981f7d3237a2d177e6a1a1f86b664fd3a3df1) |
| Seal immutable snapshot | SUCCESS | [0x64f295…4834](https://explorer-studio.genlayer.com/tx/0x64f2950703376812970b3f3d0f4947264959609556eaf43920458c2db5de4834) |
| Unauthorized analysis | ERROR `OWNER_ONLY` | [0x19e88c…8c78](https://explorer-studio.genlayer.com/tx/0x19e88c01fde655b6e2d50e95944edba76fabaade5bc714992c1637f0ddae8c78) |
| Owner analyzes pair | SUCCESS | [0x32369f…0b42](https://explorer-studio.genlayer.com/tx/0x32369f605bc19668d77d00108b7dd939be1bd649f1e7ad09525d61a4d4b10b42) |
| Activate exact snapshot | SUCCESS | [0x6228ca…0aed](https://explorer-studio.genlayer.com/tx/0x6228cac9c4762f0362a4aac6886d50e8ca02e6d18cc50f0d3fca1fdb4ed10aed) |

Authoritative readback: set `0` is `ACTIVE`, graph coverage is `1/1`, resolved
coverage is `1/1`, and the persisted edge is `COMPATIBLE` with `same_scope=NO`.

## Conflict and resolution lifecycle

| Step | Final execution | Transaction |
|---|---|---|
| Create conflict set | SUCCESS | [0x549a11…37dd](https://explorer-studio.genlayer.com/tx/0x549a11988e68cb043276af409a8e50a54c38596ce126be9ef91d120c572e37dd) |
| Add mandatory-approval rule | SUCCESS | [0x96bd12…d6e8](https://explorer-studio.genlayer.com/tx/0x96bd125852e59daf5d71b6b142de1babab00cfa68148bbd13e964649d095d6e8) |
| Add zero-approval rule | SUCCESS | [0x764b62…3a4b](https://explorer-studio.genlayer.com/tx/0x764b62195ed2d8b865c518e18b92aabccd56f08f1a135fc97ad9f2b64b973a4b) |
| Seal immutable snapshot | SUCCESS | [0x44354e…0bf2](https://explorer-studio.genlayer.com/tx/0x44354e77c467c24db32705fd59d860caae12c3540bfedf6cd68f68be8e300bf2) |
| Analyze conflicting pair | SUCCESS | [0x5afdd2…ff51](https://explorer-studio.genlayer.com/tx/0x5afdd2e957c661b9c3f9dcb37985c182ba5abb5e45eebc899ea5a555ae95ff51) |
| Record explicit resolution | SUCCESS | [0x8bfe90…9288](https://explorer-studio.genlayer.com/tx/0x8bfe9052ba707b57a3bce90f9e7d2c7982d586c1771773f465749ac7826d9288) |
| Activate wrong snapshot | ERROR `SNAPSHOT_MISMATCH` | [0xca7ae8…1cec](https://explorer-studio.genlayer.com/tx/0xca7ae898c2b38e6bdb2afc1b09deeb41de4b9a4da0cc4dd8a3eeacb765df1cec) |
| Activate exact snapshot | SUCCESS | [0x22a952…6e27](https://explorer-studio.genlayer.com/tx/0x22a952201f3b0c6fdcdba021719e6be8b483d481abf2984f9fb9085f5e676e27) |

Authoritative readback: set `1` is `ACTIVE`; the persisted edge is `CONFLICT`,
`same_scope=YES`, both compatibility fields are `NO`, and its non-empty
`resolution_digest` binds the owner resolution to the validator analysis digest.

The complete machine-readable receipts and state readbacks are in
[`STUDIONET_E2E.json`](./STUDIONET_E2E.json). No local mock output is represented
as StudioNet evidence.
