// Quick test to verify uniqueness
const testResults = new Set();
const iterations = 1000;

for (let i = 0; i < iterations; i++) {
	const cards = new Set();
	const cardCount = 10;
	
	// Simulate the Fisher-Yates approach
	const remaining = Array.from({ length: 78 }, (_, idx) => idx);
	
	for (let j = 0; j < cardCount; j++) {
		const randomIndex = Math.floor(Math.random() * remaining.length);
		const card = remaining[randomIndex];
		cards.add(card);
		remaining.splice(randomIndex, 1);
	}
	
	if (cards.size !== cardCount) {
		console.log(`FAIL: Got ${cards.size} unique cards, expected ${cardCount}`);
		testResults.add('FAIL');
	}
}

if (testResults.size === 0) {
	console.log(`✅ SUCCESS: All ${iterations} iterations produced unique cards`);
} else {
	console.log(`❌ FAILURE: Some iterations had duplicates`);
}
