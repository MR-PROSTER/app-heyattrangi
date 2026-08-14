async function test() {
  const q = encodeURIComponent("आप कैसे हो?");
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&dt=rm&q=${q}`);
  const data = await res.json();
  console.log("RM_PAYLOAD:", JSON.stringify(data, null, 2));
}
test();
