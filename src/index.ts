import express, { Request, Response, Application } from "express";
import axios from "axios";
import dotenv from "dotenv";
import router from "./router";
const cors = require("cors");

//For env File
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(
	cors({
		origin: ["http://localhost:5173", "https://scryfall-card-collector-frontend.vercel.app"],
	})
);

app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
	res.send("Welcome to Express & TypeScript Server");
});

app.get("/scryfall", async (req: Request, res: Response) => {
	try {
		const response = await axios.get(
			"https://api.scryfall.com/cards/search?order=cmc&q=c%3Ared+pow%3D3"
		);
		const data = response.data;
		res.json(data);
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "failed" });
	}
});

app.listen(port, () => {
	console.log(`Server is Fire at http://localhost:${port}`);
});
