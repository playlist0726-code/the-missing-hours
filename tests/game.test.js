import test from 'node:test';
import assert from 'node:assert/strict';
import {ACTIVITIES,createDay,removedHours,scoresFor,adjust,completeDay,mostTimeLost,formatTime} from '../game.js';
test('balanced initial state and independent resets',()=>{
 const a=createDay(), b=createDay();
 assert.equal(a.reduce((n,x)=>n+x.hours,0),24);
 adjust(a,0,'minus');
 assert.equal(b[0].hours,8);
 assert.deepEqual(scoresFor(b),{health:100,education:100,life:100});
});
test('three cuts cap, activity minimum, and full restoration',()=>{
 const day=createDay();
 for(let i=0;i<5;i++) adjust(day,0,'minus');
 assert.equal(day[0].hours,5); assert.equal(removedHours(day),3);
 assert.equal(adjust(day,1,'minus'),false);
 assert.equal(adjust(day,0,'minus'),false);
 for(let i=0;i<5;i++) adjust(day,0,'plus');
 assert.equal(day[0].hours,8); assert.equal(removedHours(day),0);
 assert.equal(adjust(day,4,'minus'),true);
 assert.equal(adjust(day,4,'minus'),false);
});
test('weighted scores and tied time impacts',()=>{
 const day=createDay();
 [0,1,3].forEach(i=>adjust(day,i,'minus'));
 assert.deepEqual(scoresFor(day),{health:88,education:87,life:91});
 assert.deepEqual(mostTimeLost(day),['health','education','life']);
});
test('timeout preserves existing cuts and fills to exactly 21 activity hours',()=>{
 const day=createDay(); adjust(day,5,'minus'); completeDay(day);
 assert.equal(day[5].hours,1); assert.equal(day[0].hours,6);
 assert.equal(removedHours(day),3);
 assert.equal(day.reduce((n,x)=>n+x.hours,0),21);
 const snapshot=JSON.stringify(day); completeDay(day); assert.equal(JSON.stringify(day),snapshot);
});
test('all legal sequences through three cuts respect constraints',()=>{
 function visit(day) {
  assert.ok(removedHours(day)<=3);
  day.forEach((a,i)=>assert.ok(a.hours>=a.min && a.hours<=ACTIVITIES[i].hours));
  Object.values(scoresFor(day)).forEach(n=>assert.ok(n>=0 && n<=100));
  if(removedHours(day)===3) return;
  ACTIVITIES.forEach((_,i)=> {const next=day.map(a=>({...a})); if(adjust(next,i,'minus')) visit(next);});
 }
 visit(createDay());
});
test('clock formats start, final seconds, and expired values',()=>{
 assert.equal(formatTime(60),'01:00'); assert.equal(formatTime(9),'00:09'); assert.equal(formatTime(-1),'00:00');
});
test('each difficulty enforces its own goal, undo, and timeout',async()=>{
 const {MODES}=await import('../game.js');
 for (const mode of Object.values(MODES)) {
  const day=createDay();
  adjust(day,5,'minus',mode.hours);
  completeDay(day,mode.hours);
  assert.equal(removedHours(day),mode.hours);
  assert.equal(day[5].hours,1);
  assert.equal(adjust(day,3,'minus',mode.hours),false);
  assert.equal(adjust(day,0,'plus',mode.hours),true);
  assert.equal(removedHours(day),mode.hours-1);
  assert.equal(adjust(day,3,'minus',mode.hours),true);
  assert.equal(day.reduce((n,x)=>n+x.hours,0),24-mode.hours);
  day.forEach((a,i)=>assert.ok(a.hours>=a.min && a.hours<=ACTIVITIES[i].hours));
 }
});
