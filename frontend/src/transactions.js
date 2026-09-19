export const VERSION='RULE_MESH_V1';
export function normalizeHash(v){const h=typeof v==='string'?v:v?.txId||v?.hash||v?.transactionHash;if(!/^0x[0-9a-f]{64}$/i.test(h||''))throw Error('Wallet returned no valid transaction hash.');return h}
export function receiptState(x){
 const s=String(x?.statusName||x?.status_name||x?.status||'').toUpperCase();
 const receipts=Array.isArray(x?.consensus_data?.leader_receipt)?x.consensus_data.leader_receipt:[];
 const executions=[x?.execution_result,x?.tx_execution_result_name,...receipts.map(r=>r?.execution_result)].filter(Boolean).map(v=>String(v).toUpperCase());
 const explicitFailure=['FAILED','REJECTED','CANCELLED'].includes(s)||executions.some(v=>v.includes('ERROR'));
 const terminal=['ACCEPTED','FINALIZED','UNDETERMINED'].includes(s);
 const failedReceipt=receipts.find(r=>String(r?.execution_result||'').toUpperCase().includes('ERROR'));
 const reason=typeof failedReceipt?.result?.payload==='string'?failedReceipt.result.payload:null;
 return{label:s||'PENDING',accepted:terminal&&!explicitFailure,failed:explicitFailure,reason};
}
