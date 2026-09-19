import pytest
C="contracts/rule_mesh.py"; OWNER=bytes.fromhex("11"*20); OTHER=bytes.fromhex("22"*20)
def deploy(vm,d):vm.strict_mocks=True;vm.check_pickling=True;return d(C,sdk_version="v0.2.16")
def setup(c,vm):
    with vm.prank(OWNER):
        c.create_policy_set("Treasury policy");c.add_rule(0,"Transfers above 10000 GEN require three approvals.","TRANSFER","TREASURY",80);c.add_rule(0,"Transfers of 10000 GEN or less require one approval.","TRANSFER","TREASURY",50);c.seal_policy_set(0)
def mock(vm,relation="COMPATIBLE",scope="YES",obl="YES",exc="YES"):
    vm.mock_llm("RULE_MESH_PAIR_ANALYSIS_V1",{"relation":relation,"same_scope":scope,"obligations_compatible":obl,"exceptions_compatible":exc})
def test_compatible_activation(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy);setup(c,direct_vm);mock(direct_vm)
    with direct_vm.prank(OWNER):c.analyze_pair(0,0,1)
    p=c.get_policy_set(0);assert p.state=="READY" and p.edge_count==1
    with direct_vm.prank(OWNER):c.activate_policy_set(0,p.snapshot_digest)
    assert c.get_policy_set(0).state=="ACTIVE"
def test_conflict_resolution(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy);setup(c,direct_vm);mock(direct_vm,"CONFLICT","YES","NO","YES")
    with direct_vm.prank(OWNER):c.analyze_pair(0,0,1)
    assert c.get_policy_set(0).state=="CONFLICTED"
    with direct_vm.prank(OWNER):c.resolve_edge(0,0,1,"Lower-value rule applies only at or below the threshold.")
    assert c.get_policy_set(0).state=="READY" and c.get_edge(0,0,1).resolved
def test_unclear_requires_resolution(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy);setup(c,direct_vm);mock(direct_vm,"UNCLEAR","UNCLEAR","UNCLEAR","UNCLEAR")
    with direct_vm.prank(OWNER):c.analyze_pair(0,0,1)
    assert c.get_policy_set(0).unclear_count==1 and c.get_policy_set(0).state=="CONFLICTED"
def test_model_cross_field_failure_becomes_unclear(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy);setup(c,direct_vm);mock(direct_vm,"COMPATIBLE","YES","NO","YES")
    with direct_vm.prank(OWNER):c.analyze_pair(0,0,1)
    assert c.get_edge(0,0,1).relation=="UNCLEAR"
def test_authorization_and_duplicate(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy);setup(c,direct_vm);mock(direct_vm)
    with direct_vm.prank(OTHER),direct_vm.expect_revert("OWNER_ONLY"):c.analyze_pair(0,0,1)
    with direct_vm.prank(OWNER):c.analyze_pair(0,0,1)
    with direct_vm.prank(OWNER),direct_vm.expect_revert("ANALYSIS_CLOSED"):c.analyze_pair(0,0,1)
def test_cross_set_pair(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy);setup(c,direct_vm)
    with direct_vm.prank(OWNER):c.create_policy_set("Other");c.add_rule(1,"Other rule.","READ","OTHER",1)
    with direct_vm.prank(OWNER),direct_vm.expect_revert("CROSS_SET_PAIR"):c.analyze_pair(0,0,2)
def test_snapshot_binding_and_terminal(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy);setup(c,direct_vm);mock(direct_vm)
    with direct_vm.prank(OWNER):c.analyze_pair(0,0,1)
    with direct_vm.prank(OWNER),direct_vm.expect_revert("SNAPSHOT_MISMATCH"):c.activate_policy_set(0,"0"*64)
    p=c.get_policy_set(0)
    with direct_vm.prank(OWNER):c.activate_policy_set(0,p.snapshot_digest);c.supersede_policy_set(0)
    assert c.get_policy_set(0).state=="SUPERSEDED"
def test_duplicate_rule_and_seal_bounds(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy)
    with direct_vm.prank(OWNER):c.create_policy_set("One");c.add_rule(0,"Rule.","READ","DOCS",1)
    with direct_vm.prank(OWNER),direct_vm.expect_revert("DUPLICATE_RULE"):c.add_rule(0,"Rule.","READ","DOCS",1)
    with direct_vm.prank(OWNER),direct_vm.expect_revert("INVALID_RULE_COUNT"):c.seal_policy_set(0)
def test_config(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy);assert c.get_config()["version"]=="RULE_MESH_V1" and c.get_config()["max_rules"]==8

def test_three_rule_graph_cannot_activate_until_complete(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy)
    with direct_vm.prank(OWNER):
        c.create_policy_set("Three-rule policy")
        c.add_rule(0,"Production deploys require two approvals.","DEPLOY","PRODUCTION",90)
        c.add_rule(0,"Emergency deploys require an incident ticket.","DEPLOY","PRODUCTION",80)
        c.add_rule(0,"Read-only checks do not require approval.","READ","PRODUCTION",20)
        c.seal_policy_set(0)
    mock(direct_vm)
    with direct_vm.prank(OWNER):
        c.analyze_pair(0,0,1)
        c.analyze_pair(0,0,2)
    p=c.get_policy_set(0)
    assert p.required_edges==3 and p.edge_count==2 and p.state=="ANALYZING"
    with direct_vm.prank(OWNER),direct_vm.expect_revert("SET_NOT_READY"):
        c.activate_policy_set(0,p.snapshot_digest)
    with direct_vm.prank(OWNER):c.analyze_pair(0,1,2)
    assert c.get_policy_set(0).state=="READY"

def test_unauthorized_resolution_preserves_conflict(direct_vm,direct_deploy):
    c=deploy(direct_vm,direct_deploy);setup(c,direct_vm);mock(direct_vm,"CONFLICT","YES","NO","YES")
    with direct_vm.prank(OWNER):c.analyze_pair(0,0,1)
    before=c.get_policy_set(0)
    with direct_vm.prank(OTHER),direct_vm.expect_revert("OWNER_ONLY"):
        c.resolve_edge(0,1,0,"Unauthorized resolution must not be recorded.")
    after=c.get_policy_set(0)
    assert after.state==before.state=="CONFLICTED" and after.resolved_count==before.resolved_count==0
    assert not c.get_edge(0,1,0).resolved
