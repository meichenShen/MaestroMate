import {test} from 'node:test';import assert from 'node:assert/strict';
import {handleFeedback} from '../worker/feedback.ts';
import {openLocalDatabase} from '../scripts/local-d1.mjs';
const origin='https://maestromate.test';
const payload=()=>({id:crypto.randomUUID(),kind:'idea',message:'A longer listening preview would be lovely.',email:'',page:'#about'});
async function setup(){const db=await openLocalDatabase(':memory:');const session=await handleFeedback(new Request(origin+'/api/feedback/session',{headers:{'x-feedback-form':'1',origin}}),{DB:db});assert.equal(session.status,200);return {db,token:(await session.json()).token};}
const post=(p,token,extra={})=>new Request(origin+'/api/feedback',{method:'POST',headers:{origin,'content-type':'application/json','x-feedback-token':token,...extra},body:JSON.stringify(p)});
test('anonymous capability saves feedback privately and retry is idempotent',async()=>{const {db,token}=await setup();try{const p=payload();const res=await handleFeedback(post(p,token),{DB:db});assert.equal(res.status,201);assert.equal((await res.json()).id,p.id);assert.equal((await handleFeedback(post(p,token),{DB:db})).status,200);assert.equal((await db.prepare('select count(*) as n from feedback').first()).n,1);assert.equal((await db.prepare('select message from feedback').first()).message,p.message);assert.equal((await handleFeedback(new Request(origin+'/api/feedback'),{DB:db})).status,405);}finally{db.close()}});
test('origin, token, input, conflicting retry and body bounds are enforced',async()=>{const {db,token}=await setup();try{const p=payload();assert.equal((await handleFeedback(post(p,token,{origin:'https://elsewhere.test'}),{DB:db})).status,403);assert.equal((await handleFeedback(post(p,'bad'),{DB:db})).status,403);assert.equal((await handleFeedback(post({...p,message:' '},token),{DB:db})).status,400);assert.equal((await handleFeedback(post({...p,email:'not an email'},token),{DB:db})).status,400);assert.equal((await handleFeedback(post({...p,message:'x'.repeat(12000)},token),{DB:db})).status,413);await handleFeedback(post(p,token),{DB:db});assert.equal((await handleFeedback(post({...p,message:'Changed text'},token),{DB:db})).status,409);}finally{db.close()}});
test('expired capabilities and rapid intake fail without claiming receipt',async()=>{const {db,token}=await setup();try{for(let i=0;i<3;i++)assert.equal((await handleFeedback(post(payload(),token),{DB:db})).status,201);const limited=await handleFeedback(post(payload(),token),{DB:db});assert.equal(limited.status,429);await db.prepare('update feedback_sessions set expires_at=0').run();assert.equal((await handleFeedback(post(payload(),token),{DB:db})).status,403);assert.equal((await db.prepare('select count(*) as n from feedback').first()).n,3);}finally{db.close()}});
test('same-origin session issuance is gated and storage failure never claims receipt',async()=>{
  const {db,token}=await setup();try{
    assert.equal((await handleFeedback(new Request(origin+'/api/feedback/session',{headers:{origin}}),{DB:db})).status,403);
    assert.equal((await handleFeedback(new Request(origin+'/api/feedback/session',{headers:{'x-feedback-form':'1','sec-fetch-site':'cross-site'}}),{DB:db})).status,403);
    assert.equal((await handleFeedback(new Request(origin+'/api/feedback/session',{headers:{'x-feedback-form':'1','sec-fetch-site':'same-origin'}}),{DB:db})).status,200);
    const broken={prepare(){throw new Error('unavailable')}};
    const failed=await handleFeedback(post(payload(),token),{DB:broken});
    assert.equal(failed.status,503);assert.deepEqual(await failed.json(),{ok:false});
  }finally{db.close()}
});
test('concurrent duplicates persist once and an exact retry works with a fresh capability',async()=>{
  const {db,token}=await setup();try{
    const p=payload();const responses=await Promise.all(Array.from({length:5},()=>handleFeedback(post(p,token),{DB:db})));
    assert.equal(responses.filter(r=>r.status===201).length,1);assert.ok(responses.every(r=>[200,201].includes(r.status)));
    const fresh=await handleFeedback(new Request(origin+'/api/feedback/session',{headers:{origin,'x-feedback-form':'1'}}),{DB:db});
    assert.equal((await handleFeedback(post(p,(await fresh.json()).token),{DB:db})).status,200);
    assert.equal((await db.prepare('select count(*) as n from feedback').first()).n,1);
  }finally{db.close()}
});
