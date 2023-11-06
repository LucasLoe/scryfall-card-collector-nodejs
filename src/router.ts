import { Router, Request, Response } from "express";
import axios from "axios";
import sleep from "./functions/sleep";


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

router.get("/search-array", async (req: Request, res: Response) => {
	async function fetchData(query, requestIndex) {
		try {
			await sleep(80 * requestIndex); // delay needed for avoiding a scryfall ban according to the api docs
			const response = await axios.get(
				`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(query)}`
			);
			return {
				success: true,
				query: query,
				data: response.data,
			};
		} catch (error) {
			return {
				success: false,
				query: query,
				data: undefined,
			};
		}
	}

	try {
		let { cardNames } = req.query as { cardNames: string };
		const cardNameArray = cardNames.split(",");
		console.log(cardNames)

		if (!cardNameArray || !Array.isArray(cardNameArray)) {
			return res.status(400).json({ error: "You must provide an array of strings" });
		}

		const axiosResponses = await Promise.allSettled(
			cardNameArray.map((query, idx) => fetchData(query, idx))
		);

		const flattenedResponse = axiosResponses
			.filter((res) => res.status === "fulfilled")
			.map((res) => res.status === "fulfilled" && res.value);
		console.log(axiosResponses);

		const fetchedCards = flattenedResponse
			.filter((res) => res.success)
			.map((res) => ({ cardName: res.query, data: res.data }));

		const rejectedCards = flattenedResponse
			.filter((res) => !res.success)
			.map((res) => ({ cardName: res.query, data: null }));

		res.status(200).json({ fetchedCards: fetchedCards, rejectedCards: rejectedCards });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

export default router;
