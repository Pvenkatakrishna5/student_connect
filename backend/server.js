const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Backend Running Successfully 🚀");
});

app.get("/jobs", (req, res) => {
    res.json([
        { title: "Math Tutor", payment: 500 },
        { title: "Data Entry", payment: 300 }
    ]);
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});