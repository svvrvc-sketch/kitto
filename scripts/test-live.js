async function test() {
  const res = await fetch('https://kitto-fakv.vercel.app');
  const text = await res.text();
  const chunks = text.match(/_next\/static\/chunks\/[a-zA-Z0-9_\-\.]+\.js/g) || [];
  console.log('Total chunks:', chunks.length);
  let found = false;
  for (const c of chunks) {
    const r = await fetch('https://kitto-fakv.vercel.app/' + c);
    const ct = await r.text();
    if (ct.includes('ncggomxerhwlnoqzdxch')) {
      console.log('Found Supabase URL in chunk:', c);
      found = true;
      break;
    }
  }
  if (!found) {
    console.log('ALERT: Supabase URL NOT FOUND IN ANY CHUNK ON VERCEL!');
  }
}
test();
