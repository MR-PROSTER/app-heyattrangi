async function test() {
  try {
    const result = await fetch('http://localhost:3000/api/pragya/chat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
          message: "I am constantly worried about gaining weight and I have started restricting what I eat",
          is_new_session: true
       })
    });
    const data = await result.json();
    console.log("CHAT_API_RESPONSE:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
