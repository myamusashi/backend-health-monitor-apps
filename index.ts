import express from 'express';

const app = express();

app.get("/", (req, res) => {
	res.json({
		"hellow": "world"
	})
});

app.listen("3000", () => {
	console.log("server run");
});
