declare module 'rng-with-intention' {
	export class RngWithIntention {
		constructor(options?: { includeTimestamp?: boolean; includeEntropy?: boolean });
		draw(intention: string, max: number): { index: number; timestamp: string };
		drawMultiple(intention: string, max: number, count: number, allowDuplicates?: boolean): { indices: number[]; timestamp: string };
	}
}
