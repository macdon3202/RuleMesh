import {createClient,createAccount} from '../frontend/node_modules/genlayer-js/dist/index.js';
import {studionet} from '../frontend/node_modules/genlayer-js/dist/chains/index.js';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';

const address=process.env.RULEMESH_ADDRESS;
if(!/^0x[0-9a-f]{40}$/i.test(address||''))throw Error('SET_RULEMESH_ADDRESS');
const ROOT=new URL('../../',import.meta.url);
const stateDir=new URL('./.state/',import.meta.url);mkdirSync(stateDir,{recursive:true});
const stateFile=new URL('./.state/studionet.json',import.meta.url);
const evidenceFile=new URL('../docs/STUDIONET_E2E.json',import.meta.url);
const encode=x=>JSON.stringify(x,(_,v)=>typeof v==='bigint'?String(v):v,2);
function secrets(){return Object.fromEntries(readFileSync(new URL('secrets/genlayer-test-wallets.env',ROOT),'utf8').split(/\r?\n/).filter(x=>x.includes('=')).map(x=>{const i=x.indexOf('=');return[x.slice(0,i),x.slice(i+1).replace(/^<|>$/g,'').trim()]}));}
function signer(which){const key=secrets()[`SERVICE_LEDGER_KEY_${which}`];if(!key)throw Error(`MISSING_TEST_WALLET_${which}`);return createClient({chain:studionet,account:createAccount(key.startsWith('0x')?key:`0x${key}`)});}
const reader=createClient({chain:studionet});
const read=(functionName,args=[])=>reader.readContract({address,functionName,args});
let state=existsSync(stateFile)?JSON.parse(readFileSync(stateFile,'utf8')):{address,startedAt:new Date().toISOString(),actions:{},readbacks:{}};
if(state.address.toLowerCase()!==address.toLowerCase())throw Error('STATE_ADDRESS_MISMATCH');
const save=()=>writeFileSync(stateFile,encode(state)+'\n');
async function receipt(hash,allowError=false){for(let i=0;i<120;i++){const tx=await reader.getTransaction({hash}),status=String(tx.statusName||tx.status||'').toUpperCase();if(['ACCEPTED','FINALIZED','UNDETERMINED'].includes(status)){const rs=(tx.consensus_data?.leader_receipt||[]).filter(x=>x.result?.payload!=='idle');const success=rs.length>0&&rs.every(x=>x.execution_result==='SUCCESS');if(!success&&!allowError)throw Error(`GENVM_ERROR ${hash}`);return{status,execution:success?'SUCCESS':'ERROR',result:rs[0]?.result?.payload??null};}await new Promise(r=>setTimeout(r,3000));}throw Error(`PENDING_NO_RESUBMIT ${hash}`);}
async function send(name,who,functionName,args=[],allowError=false){let item=state.actions[name];if(!item){item=state.actions[name]={who,functionName,args,phase:'SENDING',submittedAt:new Date().toISOString()};save();const raw=await signer(who).writeContract({address,functionName,args});item.hash=typeof raw==='string'?raw:raw?.hash||raw?.txId||raw?.transactionHash;if(!item.hash)throw Error(`MALFORMED_TX_RESPONSE ${name}`);item.phase='SUBMITTED';save();}item.receipt=await receipt(item.hash,allowError);item.phase='VERIFIED';save();console.log(encode({name,hash:item.hash,receipt:item.receipt}));return item;}
async function main(){
 const config=await read('get_config');if(config.version!=='RULE_MESH_V1')throw Error(`VERSION_MISMATCH ${config.version}`);state.initialConfig=config;save();
 if(state.positiveSetId===undefined){state.positiveSetId=Number(config.set_count);state.firstRuleId=Number(config.rule_count);save();}
 const p=state.positiveSetId,r0=state.firstRuleId,r1=r0+1;
 await send('positive_create','A','create_policy_set',['Operational separation']);
 await send('positive_rule_docs','A','add_rule',[p,'Documentation editors may update public FAQ pages.','EDIT','PUBLIC_DOCS',30]);
 await send('positive_rule_treasury','A','add_rule',[p,'Treasury signers may approve transfers after quorum review.','APPROVE','TREASURY',80]);
 await send('positive_seal','A','seal_policy_set',[p]);
 await send('negative_unauthorized_analysis','B','analyze_pair',[p,r0,r1],true);
 await send('positive_analyze','A','analyze_pair',[p,r0,r1]);
 let ps=await read('get_policy_set',[p]);
 if(ps.state==='CONFLICTED')await send('positive_resolution','A','resolve_edge',[p,r0,r1,'The rules govern distinct actors, actions and resources and therefore apply independently.']);
 ps=await read('get_policy_set',[p]);
 await send('positive_activate','A','activate_policy_set',[p,ps.snapshot_digest]);
 state.readbacks.positiveSet=await read('get_policy_set',[p]);state.readbacks.rule0=await read('get_rule',[r0]);state.readbacks.rule1=await read('get_rule',[r1]);state.readbacks.edge=await read('get_edge',[p,r0,r1]);
 const latest=await read('get_config');
 if(state.conflictSetId===undefined){state.conflictSetId=Number(latest.set_count);state.conflictFirstRuleId=Number(latest.rule_count);save();}
 const c=state.conflictSetId,c0=state.conflictFirstRuleId,c1=c0+1;
 await send('conflict_create','A','create_policy_set',['Production deployment exceptions']);
 await send('conflict_rule_approval','A','add_rule',[c,'Every production deployment requires two independent approvals, including emergencies.','DEPLOY','PRODUCTION',90]);
 await send('conflict_rule_bypass','A','add_rule',[c,'Emergency production deployments must proceed with zero approvals.','DEPLOY','PRODUCTION',100]);
 await send('conflict_seal','A','seal_policy_set',[c]);
 await send('conflict_analyze','A','analyze_pair',[c,c0,c1]);
 let cs=await read('get_policy_set',[c]);
 if(cs.state!=='CONFLICTED')throw Error(`EXPECTED_CONFLICTED_GOT_${cs.state}`);
 await send('conflict_resolve','A','resolve_edge',[c,c0,c1,'Emergency deployment is blocked until two independent approvers authorize it; urgency does not bypass quorum.']);
 cs=await read('get_policy_set',[c]);
 await send('negative_snapshot_mismatch','A','activate_policy_set',[c,'0'.repeat(64)],true);
 await send('conflict_activate','A','activate_policy_set',[c,cs.snapshot_digest]);
 state.readbacks.conflictSet=await read('get_policy_set',[c]);state.readbacks.conflictRule0=await read('get_rule',[c0]);state.readbacks.conflictRule1=await read('get_rule',[c1]);state.readbacks.conflictEdge=await read('get_edge',[c,c0,c1]);
 state.completedAt=new Date().toISOString();state.finalConfig=await read('get_config');save();writeFileSync(evidenceFile,encode(state)+'\n');console.log(encode({complete:true,evidence:new URL(evidenceFile).pathname,readbacks:state.readbacks}));
}
await main();
