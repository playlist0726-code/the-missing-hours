// Pure game rules: the interface and tests use the same scoring logic.
export const MODES = Object.freeze({
  easy: Object.freeze({ name:'Easy', hours:2, seconds:90 }),
  normal: Object.freeze({ name:'Normal', hours:3, seconds:60 }),
  hard: Object.freeze({ name:'Hard', hours:4, seconds:30 })
});
// Each milestone is shown once per round, even after an undo.
export const MILESTONES = Object.freeze([
  { fraction:0.5, message:'Halfway there! Every hour has a tradeoff.' },
  { fraction:1, message:'Journey ready! Review your choices, then see your impact.' }
]);
export const ACTIVITIES = Object.freeze([
  { id:'sleep', name:'Sleep', hours:8, min:5, category:'health', loss:12 },
  { id:'class', name:'Class', hours:5, min:2, category:'education', loss:13 },
  { id:'study', name:'Study', hours:3, min:0, category:'education', loss:10 },
  { id:'work', name:'Work', hours:4, min:1, category:'life', loss:9 },
  { id:'meals', name:'Meals', hours:2, min:1, category:'health', loss:10 },
  { id:'friends', name:'Friends', hours:2, min:0, category:'life', loss:7 }
].map(Object.freeze));
export const createDay = () => ACTIVITIES.map(a => ({...a}));
export const removedHours = day => ACTIVITIES.reduce((sum,a,i) => sum + a.hours - day[i].hours,0);
export function scoresFor(day) {
  const scores = {health:100, education:100, life:100};
  ACTIVITIES.forEach((a,i) => { scores[a.category] -= (a.hours-day[i].hours)*a.loss; });
  return scores;
}
export function adjust(day,index,direction,target=3) {
  const a = day[index], original = ACTIVITIES[index];
  if (!a || !['minus','plus'].includes(direction)) return false;
  if (direction === 'minus' && (a.hours <= a.min || removedHours(day) >= target)) return false;
  if (direction === 'plus' && a.hours >= original.hours) return false;
  a.hours += direction === 'minus' ? -1 : 1;
  return true;
}
export function completeDay(day,target=3) {
  // A predictable timeout rule: fill remaining cuts in listed activity order.
  for (let i=0;i<day.length && removedHours(day)<target;i++) {
    while (day[i].hours>day[i].min && removedHours(day)<target) adjust(day,i,'minus',target);
  }
  return day;
}
export function mostTimeLost(day) {
  const lost = {health:0,education:0,life:0};
  ACTIVITIES.forEach((a,i) => { lost[a.category] += a.hours-day[i].hours; });
  const max = Math.max(...Object.values(lost));
  return Object.keys(lost).filter(key => lost[key]===max);
}
export const formatTime = seconds => `${String(Math.floor(Math.max(0,seconds)/60)).padStart(2,'0')}:${String(Math.max(0,seconds)%60).padStart(2,'0')}`;
