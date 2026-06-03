import { describe, test, expect, beforeEach } from 'vitest';
import JSZip from 'jszip';
import { sanitizeAndFilterZipEntries } from '../../src/core/DeckLoader';

// Helper: build a JSZip with the given entries under cards/
async function buildZip(entries: { path: string; content?: string }[]): Promise<InstanceType<typeof JSZip>> {
	const zip = new JSZip();
	for (const { path, content } of entries) {
		zip.file(path, content ?? 'data');
	}
	// Round-trip through generateAsync so JSZip parses its own folder structure
	const buffer = await zip.generateAsync({ type: 'arraybuffer' });
	return JSZip.loadAsync(buffer);
}

describe('sanitizeAndFilterZipEntries()', () => {
	describe('allowed image types', () => {
		test.each(['jpg', 'jpeg', 'png', 'gif', 'webp'])(
			'accepts .%s files',
			async (ext) => {
				const zip = await buildZip([{ path: `cards/image.${ext}` }]);
				const result = sanitizeAndFilterZipEntries(zip);
				expect(result).toHaveLength(1);
				expect(result[0].name).toBe(`image.${ext}`);
			}
		);

		test('rejects non-image files', async () => {
			const zip = await buildZip([
				{ path: 'cards/image.png' },
				{ path: 'cards/script.js' },
				{ path: 'cards/data.json' },
				{ path: 'cards/readme.md' },
			]);
			const result = sanitizeAndFilterZipEntries(zip);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('image.png');
		});

		test('is case-insensitive for extensions', async () => {
			const zip = await buildZip([
				{ path: 'cards/image.PNG' },
				{ path: 'cards/photo.JPG' },
			]);
			const result = sanitizeAndFilterZipEntries(zip);
			expect(result).toHaveLength(2);
		});
	});

	describe('path traversal prevention', () => {
		test('blocks ../ traversal in entry paths', async () => {
			// Craft a zip with a traversal path manually (bypassing JSZip's folder helper)
			const zip = new JSZip();
			zip.file('cards/../../../evil.png', 'bad');
			zip.file('cards/safe.png', 'good');
			const buffer = await zip.generateAsync({ type: 'arraybuffer' });
			const loaded = await JSZip.loadAsync(buffer);

			const result = sanitizeAndFilterZipEntries(loaded);
			const names = result.map(r => r.name);
			expect(names).not.toContain('../../../evil.png');
			expect(names.some(n => n.includes('..'))).toBe(false);
		});

		test('blocks backslash-based traversal', async () => {
			const zip = new JSZip();
			zip.file('cards/..\\..\\evil.png', 'bad');
			zip.file('cards/safe.png', 'good');
			const buffer = await zip.generateAsync({ type: 'arraybuffer' });
			const loaded = await JSZip.loadAsync(buffer);

			const result = sanitizeAndFilterZipEntries(loaded);
			const names = result.map(r => r.name);
			expect(names.some(n => n.includes('..'))).toBe(false);
		});

		test('skips directories', async () => {
			const zip = await buildZip([
				{ path: 'cards/subdir/' },
				{ path: 'cards/image.png' },
			]);
			const result = sanitizeAndFilterZipEntries(zip);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('image.png');
		});

		test('ignores files outside cards/ folder', async () => {
			const zip = await buildZip([
				{ path: 'deck.json' },
				{ path: 'readme.png' },       // image but not in cards/
				{ path: 'cards/valid.png' },
			]);
			const result = sanitizeAndFilterZipEntries(zip);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('valid.png');
		});
	});

	describe('happy path', () => {
		test('returns multiple valid images', async () => {
			const zip = await buildZip([
				{ path: 'cards/card-0.jpg' },
				{ path: 'cards/card-1.png' },
				{ path: 'cards/card-2.webp' },
			]);
			const result = sanitizeAndFilterZipEntries(zip);
			expect(result).toHaveLength(3);
			const names = result.map(r => r.name);
			expect(names).toContain('card-0.jpg');
			expect(names).toContain('card-1.png');
			expect(names).toContain('card-2.webp');
		});

		test('returns empty array when cards/ folder absent', async () => {
			const zip = await buildZip([{ path: 'deck.json' }]);
			const result = sanitizeAndFilterZipEntries(zip);
			expect(result).toHaveLength(0);
		});

		test('returns empty array when cards/ folder is empty', async () => {
			const zip = await buildZip([{ path: 'cards/' }]);
			const result = sanitizeAndFilterZipEntries(zip);
			expect(result).toHaveLength(0);
		});
	});
});
