import { describe, test, expect } from 'vitest';
import { strToU8 } from 'fflate';
import { sanitizeAndFilterZipEntries } from '../../src/core/DeckLoader';

// Helper: build a flat fflate-style record from path/content pairs
function buildEntries(entries: { path: string; content?: string }[]): Record<string, Uint8Array> {
	const result: Record<string, Uint8Array> = {};
	for (const { path, content } of entries) {
		result[path] = strToU8(content ?? 'data');
	}
	return result;
}

describe('sanitizeAndFilterZipEntries()', () => {
	describe('allowed image types', () => {
		test.each(['jpg', 'jpeg', 'png', 'gif', 'webp'])(
			'accepts .%s files',
			(ext) => {
				const files = buildEntries([{ path: `cards/image.${ext}` }]);
				const result = sanitizeAndFilterZipEntries(files);
				expect(result).toHaveLength(1);
				expect(result[0].name).toBe(`image.${ext}`);
			}
		);

		test('rejects non-image files', () => {
			const files = buildEntries([
				{ path: 'cards/image.png' },
				{ path: 'cards/script.js' },
				{ path: 'cards/data.json' },
				{ path: 'cards/readme.md' },
			]);
			const result = sanitizeAndFilterZipEntries(files);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('image.png');
		});

		test('is case-insensitive for extensions', () => {
			const files = buildEntries([
				{ path: 'cards/image.PNG' },
				{ path: 'cards/photo.JPG' },
			]);
			const result = sanitizeAndFilterZipEntries(files);
			expect(result).toHaveLength(2);
		});
	});

	describe('path traversal prevention', () => {
		test('blocks ../ traversal in entry paths', () => {
			const files = buildEntries([
				{ path: 'cards/../../../evil.png' },
				{ path: 'cards/safe.png' },
			]);
			const result = sanitizeAndFilterZipEntries(files);
			const names = result.map(r => r.name);
			expect(names).not.toContain('../../../evil.png');
			expect(names.some(n => n.includes('..'))).toBe(false);
			expect(names).toContain('safe.png');
		});

		test('blocks backslash-based traversal', () => {
			const files = buildEntries([
				{ path: 'cards/..\\..\\evil.png' },
				{ path: 'cards/safe.png' },
			]);
			const result = sanitizeAndFilterZipEntries(files);
			const names = result.map(r => r.name);
			expect(names.some(n => n.includes('..'))).toBe(false);
		});

		test('skips directory markers (trailing slash)', () => {
			const files = buildEntries([
				{ path: 'cards/subdir/' },
				{ path: 'cards/image.png' },
			]);
			const result = sanitizeAndFilterZipEntries(files);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('image.png');
		});

		test('ignores files outside cards/ folder', () => {
			const files = buildEntries([
				{ path: 'deck.json' },
				{ path: 'readme.png' },       // image but not in cards/
				{ path: 'cards/valid.png' },
			]);
			const result = sanitizeAndFilterZipEntries(files);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('valid.png');
		});
	});

	describe('happy path', () => {
		test('returns multiple valid images', () => {
			const files = buildEntries([
				{ path: 'cards/card-0.jpg' },
				{ path: 'cards/card-1.png' },
				{ path: 'cards/card-2.webp' },
			]);
			const result = sanitizeAndFilterZipEntries(files);
			expect(result).toHaveLength(3);
			const names = result.map(r => r.name);
			expect(names).toContain('card-0.jpg');
			expect(names).toContain('card-1.png');
			expect(names).toContain('card-2.webp');
		});

		test('returns empty array when no cards/ entries present', () => {
			const files = buildEntries([{ path: 'deck.json' }]);
			const result = sanitizeAndFilterZipEntries(files);
			expect(result).toHaveLength(0);
		});

		test('returns empty array when cards/ folder is empty marker only', () => {
			const files = buildEntries([{ path: 'cards/' }]);
			const result = sanitizeAndFilterZipEntries(files);
			expect(result).toHaveLength(0);
		});

		test('result data matches input bytes', () => {
			const content = 'image-bytes';
			const files = buildEntries([{ path: 'cards/card.png', content }]);
			const result = sanitizeAndFilterZipEntries(files);
			expect(result).toHaveLength(1);
			expect(result[0].data).toEqual(strToU8(content));
		});
	});
});
