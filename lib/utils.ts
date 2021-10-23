export const secondsToTime = (seconds, verbiage = ['hours ago', 'days ago', 'months ago', 'years ago']) => {
  let t = Math.floor((Math.floor(Date.now() / 1000) - seconds) /3600);
  if (t < 72) return (`${t} ${verbiage[0]}`);
  t = Math.floor(t/24); 
  if (t < 30) return (`${t} ${verbiage[1]}`);
  t = Math.floor(t/30); 
  if (t < 24) return (`${t} ${verbiage[2]}`);
  t = Math.floor(t/12); 
  return (`${t} ${verbiage[3]}`);
}