async function sendChat(message, isNew = false, sessionToken = null) {
  const payload = {
    message,
    is_new_session: isNew,
    generate_suggestions: false
  };
  if (sessionToken) {
    payload.session_id = sessionToken;
  }
  
  const result = await fetch('http://localhost:3000/api/pragya/chat', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(payload)
  });
  return await result.json();
}

async function runTests() {
  const assessmentTests = [
    { id: "asrs", text: "I cannot concentrate on my studies, I get distracted constantly, and I struggle to finish tasks." },
    { id: "ocd", text: "I have to keep checking if the door is locked over and over again." },
    { id: "phq-9", text: "I've been feeling incredibly sad and have no motivation to get out of bed." },
    { id: "gad-7", text: "I am constantly stressed and experiencing racing thoughts and panic." },
    { id: "ptsd", text: "I keep having terrifying nightmares and flashbacks to a traumatic event." },
    { id: "gad-2", text: "I am worrying slightly and feeling a bit nervous lately." },
    { id: "phq-2", text: "I'm just feeling a little down and slightly sad recently." },
    { id: "pss-10", text: "I feel completely overwhelmed by everything happening in my life and I don't know how to manage it." },
    { id: "who-5", text: "I want to do a general mental health check and see my overall well-being." },
    { id: "asq", text: "I don't think I want to be here anymore, I want to end it all." },
    { id: "c-ssrs", text: "I've been having severe thoughts of self-harm recently." },
    { id: "rses", text: "I really hate myself and feel like I am completely worthless." },
    { id: "audit-c", text: "I think I might drink too much on the weekends, maybe binge drinking." },
    { id: "audit", text: "I have been drinking alcohol every day and I am finding it difficult to stop." },
    { id: "scoff", text: "I am constantly worried about getting weight and I have started restricting from it." },
    { id: "cbi", text: "I am completely exhausted from work and emotionally drained every day." }
  ];

  console.log("=== RUNNING ASSESSMENT TESTS ===");
  for (const t of assessmentTests) {
    console.log(`\nTesting ${t.id} -> ${t.text}`);
    try {
      const resp = await sendChat(t.text, true);
      const action = resp.action;
      console.log(`Expected: ${t.id} | Rendered Action ID: ${action?.assessmentId || "NULL"} | Title: ${action?.title || action?.type || "NULL"}`);
      if (action?.assessmentId && action.assessmentId !== t.id) {
         console.log("!!! MISMATCH !!!");
      }
    } catch(e) {
      console.log(`Error testing ${t.id}: ${e.message}`);
    }
  }
  const activityTests = [
    { title: "Box Breathing", text: "Guide me through box breathing" },
    { title: "4-7-8 Breathing", text: "I want to try four seven eight breathing" },
    { title: "5-4-3-2-1 Grounding", text: "I need a grounding exercise" },
    { title: "Micro Movement", text: "I need a movement break" },
    { title: "Progressive Muscle Relaxation", text: "I want a progressive muscle relaxation exercise" },
    { title: "Journal Reflection", text: "I want to do a reflection exercise" },
    { title: "Box Breathing", text: "I have so many racing thoughts right now" },
    { title: "4-7-8 Breathing", text: "I am having difficulty relaxing" },
    { title: "5-4-3-2-1 Grounding", text: "I am feeling disconnected from reality" },
    { title: "Micro Movement", text: "I have been sitting all day" },
    { title: "Progressive Muscle Relaxation", text: "I have a lot of tense muscles" },
    { title: "Journal Reflection", text: "I need to process feelings about this" }
  ];

  console.log("\n=== RUNNING ACTIVITY TESTS ===");
  for (const t of activityTests) {
    console.log(`\nTesting Activity -> ${t.text}`);
    try {
      const resp = await sendChat(t.text, true);
      const action = resp.action;
      console.log(`Expected: ${t.title} | Rendered Action Title: ${action?.title || action?.type || "NULL"}`);
      if (action?.title && action.title !== t.title) {
         console.log("!!! MISMATCH !!!");
      }
    } catch(e) {
      console.log(`Error testing activity: ${e.message}`);
    }
  }
}

runTests().catch(console.error);
