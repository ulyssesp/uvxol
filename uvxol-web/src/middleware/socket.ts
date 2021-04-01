export default function socket({next, store}: any) {
  console.log(typeof next);
  console.log(typeof store);

  return next();
}
