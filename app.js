import { ACTIVITIES, createDay, removedHours, scoresFor, adjust, completeDay, mostTimeLost, formatTime } from './game.js';
const $ = selector => document.querySelector(selector);
let day = createDay(), phase = 'intro', deadline = 0, timerId = null, confettiId = null;
const labels = {health:'Health',education:'Education',life:'Work and relationships'};
const grid = $('#activity-grid');

// Create controls once, so updating a score never destroys keyboard focus.
grid.innerHTML = ACTIVITIES.map((a,i) => `<article class="activity" id="activity-${a.id}">
  <span class="activity-copy"><strong>${a.name}</strong><span id="detail-${a.id}"></span></span>
  <span class="adjuster">
    <button type="button" data-index="${i}" data-action="minus" aria-label="Remove one hour from ${a.name}">−</button>
    <strong id="hours-${a.id}" aria-label="${a.name} hours">${a.hours}</strong>
    <button type="button" data-index="${i}" data-action="plus" aria-label="Restore one hour to ${a.name}">+</button>
  </span></article>`).join('');
$('#day-strip').innerHTML = ACTIVITIES.map(a => `<span class="day-segment" id="segment-${a.id}"></span>`).join('') + '<span class="day-segment water" id="segment-water"></span>';

function showScreen(name) {
  for (const screen of ['start','play','result']) $(`#${screen}-screen`).hidden = screen !== name;
  const step = ['start','play','result'].indexOf(name);
  document.querySelectorAll('.step-dot').forEach((dot,i) => dot.classList.toggle('active',i===step));
  $('#step-label').textContent = ['INTRO','YOUR DAY','IMPACT'][step];
  $(`#${name}-screen`).querySelector('h1,h2').focus({preventScroll:true});
  window.scrollTo({top:0,behavior:'instant'});
}
function feedback(text) { $('#feedback').textContent = text; }
function render() {
  const removed = removedHours(day), scores = scoresFor(day);
  day.forEach((a,i) => {
    const original = ACTIVITIES[i], lost = original.hours-a.hours;
    $(`#hours-${a.id}`).textContent = a.hours;
    $(`#detail-${a.id}`).textContent = `${original.hours}h planned${lost ? ` · −${lost}h` : ''} · −${a.loss} pts/h`;
    $(`#activity-${a.id}`).classList.toggle('changed',lost>0);
    $(`[data-index="${i}"][data-action="minus"]`).disabled = phase!=='event' || a.hours<=a.min || removed>=3;
    $(`[data-index="${i}"][data-action="plus"]`).disabled = phase!=='event' || a.hours>=original.hours;
    $(`#segment-${a.id}`).style.flexGrow = a.hours;
    $(`#segment-${a.id}`).title = `${a.name}: ${a.hours} hours`;
  });
  $('#segment-water').style.flexGrow = removed;
  $('#segment-water').title = `Water journey: ${removed} hours allocated`;
  $('#day-strip').setAttribute('aria-label',day.map(a=>`${a.name} ${a.hours} hours`).join(', ')+`, water journey ${removed} hours`);
  for (const key of Object.keys(scores)) {
    $(`#${key}-score`).textContent = scores[key];
    $(`#${key}-meter`).style.width = `${scores[key]}%`;
  }
  $('#hours-value').textContent = 24-removed;
  $('#cut-count').textContent = `${removed} / 3`;
  $('#cut-meter').style.width = `${removed/3*100}%`;
  $('#finish-button').disabled = phase!=='event' || removed!==3;
}
function clearCelebration() {
  clearTimeout(confettiId);
  $('#celebration').replaceChildren();
}
function reset() {
  clearInterval(timerId); timerId = null; deadline = 0;
  clearCelebration(); day = createDay(); phase = 'intro';
  $('#timer').textContent = '01:00';
  $('.timer-card').classList.remove('urgent');
  $('#stage-label').textContent = 'DAY 1 · PLAN';
  $('#stage-title').textContent = 'Meet your day';
  $('#stage-instruction').textContent = 'Review your balanced 24-hour schedule, then lock it in.';
  $('#event-banner').hidden = true;
  $('#cut-progress').hidden = true;
  $('#lock-button').hidden = false;
  $('#finish-button').hidden = true;
  $('#aside-label').textContent = 'YOUR DAY';
  $('#aside-copy').textContent = 'Sleep, class, study, work, meals, friends. It all adds up to 24 hours. What happens when another essential need takes time?';
  feedback('Your day is balanced. Ready to see what happens next?');
  render(); showScreen('start');
}
function updateTimer() {
  if (phase!=='event') return;
  const seconds = Math.max(0,Math.ceil((deadline-performance.now())/1000));
  $('#timer').textContent = formatTime(seconds);
  $('.timer-card').classList.toggle('urgent',seconds<=10);
  if (seconds===10) feedback('10 seconds left. Finish your choices, or the game will assign remaining cuts.');
  if (seconds===0) finish(true);
}
function startEvent() {
  if (phase!=='plan') return;
  phase = 'event';
  $('#stage-label').textContent = 'DAY 1 · WATER JOURNEY';
  $('#stage-title').textContent = 'Where do 3 hours go?';
  $('#stage-instruction').textContent = 'Use − to remove hours and + to undo. Each choice changes your scores.';
  $('#event-banner').hidden = false;
  $('#cut-progress').hidden = false;
  $('#lock-button').hidden = true;
  $('#finish-button').hidden = false;
  $('#aside-label').textContent = 'ACTIVITY HOURS LEFT';
  $('#aside-copy').textContent = 'Make room for a three-hour water journey. You have 60 seconds. If time runs out, remaining hours come from the first available activities, starting with Sleep.';
  feedback('Choose an activity to lose an hour. You can undo a cut with +.');
  deadline = performance.now()+60000;
  render(); updateTimer(); timerId = setInterval(updateTimer,200);
  $('#stage-title').focus({preventScroll:true});
}
function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  clearCelebration();
  for (let i=0;i<56;i++) {
    const piece = document.createElement('i'); piece.className = 'confetti';
    piece.style.cssText = `left:${(i*37)%100}%;background:${['#ffc907','#77a8bb','#2e9df7'][i%3]};animation-delay:${i%8*.07}s;--drift:${(i%7-3)*45}px`;
    $('#celebration').append(piece);
  }
  confettiId = setTimeout(clearCelebration,3300);
}
function finish(timedOut=false) {
  if (phase!=='event' || (!timedOut && removedHours(day)!==3)) return;
  clearInterval(timerId); timerId = null;
  if (timedOut) completeDay(day);
  phase = 'result'; render();
  const scores = scoresFor(day), biggest = mostTimeLost(day).map(key=>labels[key]).join(' & ');
  $('#total-score').textContent = Object.values(scores).reduce((a,b)=>a+b,0);
  for (const key of Object.keys(scores)) {
    $(`#result-${key}`).textContent = scores[key];
    $(`#result-${key}-meter`).style.width = `${scores[key]}%`;
  }
  $('#impact-heading').textContent = timedOut ? 'Time ran out. The day still had to fit.' : `${biggest}: the biggest time tradeoff`;
  $('#impact-copy').textContent = `${timedOut ? 'The game assigned your remaining cuts in activity order. ' : ''}There is no perfect schedule when essential needs compete. Clean water closer to home can open up time for health, learning, work, and relationships.`;
  $('#choices-summary').innerHTML = '<strong>Your three hours came from:</strong><ul>'+day.map((a,i)=>ACTIVITIES[i].hours-a.hours ? `<li>${a.name}: ${ACTIVITIES[i].hours-a.hours}h removed · ${a.hours}h left</li>` : '').join('')+'</ul>';
  showScreen('result'); celebrate();
}
$('#start-button').addEventListener('click',()=> { phase='plan'; render(); showScreen('play'); });
$('#lock-button').addEventListener('click',startEvent);
$('#restart-button').addEventListener('click',reset);
$('#play-again-button').addEventListener('click',reset);
$('#finish-button').addEventListener('click',()=>finish());
grid.addEventListener('click',event=> {
  const button = event.target.closest('button[data-index]');
  if (!button || button.disabled || phase!=='event') return;
  // Check the deadline on input too, so a delayed browser tick cannot add time.
  if (performance.now()>=deadline) { finish(true); return; }
  const i=Number(button.dataset.index), a=day[i];
  if (!adjust(day,i,button.dataset.action)) return;
  render();
  feedback(removedHours(day)===3 ? 'Three hours allocated. You can undo a choice or select See my impact.' : `${a.name}: ${a.hours}h left. ${labels[a.category]} is now ${scoresFor(day)[a.category]}/100.`);
});
document.addEventListener('visibilitychange',()=> { if (!document.hidden) updateTimer(); });
reset();
