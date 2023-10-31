import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

router.get("/search", async (req: Request, res: Response) => {
	try {
		const { query } = req.query as { query: string };

		if (!query) {
			return res.status(400).json({ error: "You must supply a name parameter for the query" });
		}

		const scryfallResponse = await axios.get(
			`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(query)}`
		);

		const data = scryfallResponse.data;
		console.log(JSON.stringify(data, null, 4));
		res.json({ data });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

export default router;
