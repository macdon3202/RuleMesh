export const VERSION='RULE_MESH_V1';
export function normalizeHash(v){const h=typeof v==='string'?v:v?.txId||v?.hash||v?.transactionHash;if(!/^0x[0-9a-f]{64}$/i.test(h||''))throw Error('Wallet returned no valid transaction hash.');return h}
export function receiptState(x){const s=String(x?.status_name||x?.status||'').toUpperCase(),e=String(x?.execution_result||x?.tx_execution_result_name||'').toUpperCase();return{label:s||'PENDING',accepted:['ACCEPTED','FINALIZED'].includes(s)&&!e.includes('ERROR'),failed:['FAILED','REJECTED','CANCELLED'].includes(s)||e.includes('ERROR')}}
