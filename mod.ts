const range = (i: number) => Array.from({ length: i }).map((_, i) => i);

export const Similar = {
	ngrams: (n: number) =>
		(a: string) =>
			range(a.length)
				.filter((i) => i + n - 1 < a.length)
				.map((i) => a.slice(i, i + n)),

	allGrams: (slice: string) =>
		range(slice.length + 1)
			.map((i) => Similar.ngrams(i)(slice))
			.flat()
			.filter((s) => s.length > 0),

	partialSimilarity: (
		{ word, tokenise }: { word: string; tokenise: boolean },
	) => {
		const grams = new Set(Similar.allGrams(word));
		const seg = new Intl.Segmenter([], { granularity: "word" });

		return (sentence: string) => {
			const sliceLength = Math.min(sentence.length, word.length);

			const result = Math.max(
				...(tokenise
					? [...seg.segment(sentence)].filter((sg) => sg.isWordLike)
						.map((sg) => sg.segment)
					: Similar.ngrams(sliceLength)(sentence))
					.map((slice: string) => {
						const allPossible = Array.from(
							new Set(Similar.allGrams(slice)),
						);
						const matching = Array.from(allPossible).filter((s) =>
							grams.has(s)
						);
						const score = new Set(matching).size /
							allPossible.length;

						return score;
					}),
			);

			if (result > 1) {
				return 1;
			} else if (result < 0) {
				return 0;
			}

			return result;
		};
	},

	fullSimilarity: (w1: string) => {
		const g1 = Similar.allGrams(w1);
		const g1Comp = new Set(g1);
		return (w2: string) => {
			const g2 = Similar.allGrams(w2);
			const g2Comp = new Set(g2);
			return (
				(g2.filter((s) => g1Comp.has(s)).length +
					g1.filter((s) => g2Comp.has(s)).length) /
				(g1.length + g2.length)
			);
		};
	},
};
