import { RngWithIntention } from 'rng-with-intention';
import { TarotPracticeSettings } from './settings';

export interface ShuffleMetadata {
	shuffleCount: number;
	wasCut: boolean;
	cutPositionPercent: number | null;
	cutPositionCards: number | null;
	cutBasePercent: number | null;
	cutVariancePercent: number | null;
}

export interface PreparedDeck {
	deck: number[];
	metadata: ShuffleMetadata;
}

export async function prepareDeck(
	intention: string,
	timestamp: string,
	settings: TarotPracticeSettings
): Promise<PreparedDeck> {
	const rngi = new RngWithIntention();
	
	// Start with full deck [0-77]
	let deck = Array.from({ length: 78 }, (_, i) => i);
	
	// Shuffle deck N times (from settings)
	for (let s = 0; s < settings.shuffleCount; s++) {
		deck = await fisherYatesShuffle(deck, `${intention}-${timestamp}-shuffle-${s}`, rngi);
	}
	
	// Initialize metadata
	let wasCut = false;
	let cutPositionPercent: number | null = null;
	let cutPositionCards: number | null = null;
	let cutBasePercent: number | null = null;
	let cutVariancePercent: number | null = null;
	
	// Cut deck if enabled
	if (settings.cutDeck) {
		wasCut = true;
		
		// Use intention to get cut percentage (1-100)
		const cutResult = await rngi.draw(`${intention}-${timestamp}-cut`, 100);
		const cutBase = cutResult.index + 1; // 1-100
		cutBasePercent = cutBase;
		
		// Add variance: ±10%
		const variance = (Math.random() * 20) - 10; // -10 to +10
		cutVariancePercent = Math.round(variance * 10) / 10; // Round to 1 decimal
		
		const adjustedPercent = Math.max(1, Math.min(100, cutBase + variance));
		cutPositionPercent = Math.round(adjustedPercent * 10) / 10; // Round to 1 decimal
		
		// Calculate cut position
		const cutPosition = Math.floor((adjustedPercent / 100) * 78);
		cutPositionCards = cutPosition;
		
		// Cut: move cards from cutPosition to end, then 0 to cutPosition
		deck = [...deck.slice(cutPosition), ...deck.slice(0, cutPosition)];
	}
	
	return {
		deck,
		metadata: {
			shuffleCount: settings.shuffleCount,
			wasCut,
			cutPositionPercent,
			cutPositionCards,
			cutBasePercent,
			cutVariancePercent
		}
	};
}

async function fisherYatesShuffle(array: number[], seed: string, rngi: RngWithIntention): Promise<number[]> {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		// Use RNG to pick a position from 0 to i
		const result = await rngi.draw(`${seed}-${i}`, i + 1);
		const j = result.index;
		// Swap elements (with type safety)
		const temp = shuffled[i];
		const swapVal = shuffled[j];
		if (temp !== undefined && swapVal !== undefined) {
			shuffled[i] = swapVal;
			shuffled[j] = temp;
		}
	}
	return shuffled;
}
