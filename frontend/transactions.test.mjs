import test from'node:test';import assert from'node:assert/strict';import{normalizeHash,receiptState,VERSION}from'./src/transactions.js';
test('version is deployment guard',()=>assert.equal(VERSION,'RULE_MESH_V1'));
test('normalizes string and txId',()=>{const h='0x'+'ab'.repeat(32);assert.equal(normalizeHash(h),h);assert.equal(normalizeHash({txId:h}),h)});
test('rejects malformed wallet response',()=>assert.throws(()=>normalizeHash({}),/valid transaction hash/));
test('accepted and failed states',()=>{assert.equal(receiptState({status_name:'ACCEPTED'}).accepted,true);assert.equal(receiptState({status:'FINALIZED',execution_result:'ERROR'}).failed,true)});
test('matches live StudioNet camelCase status',()=>assert.deepEqual(receiptState({statusName:'FINALIZED',consensus_data:{leader_receipt:[{execution_result:'SUCCESS'}]}}),{label:'FINALIZED',accepted:true,failed:false,reason:null}));
test('does not accept StudioNet consensus execution errors',()=>assert.deepEqual(receiptState({statusName:'ACCEPTED',consensus_data:{leader_receipt:[{execution_result:'ERROR',result:{payload:'OWNER_ONLY'}}]}}),{label:'ACCEPTED',accepted:false,failed:true,reason:'OWNER_ONLY'}));
