const testApp = async () => {
  const req = await fetch("http://localhost:3000/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: "test", studentId: "test", coverNote: "test" })
  });
  console.log(await req.text());
};
testApp();
