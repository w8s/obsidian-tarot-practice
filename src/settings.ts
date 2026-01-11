export type InsertLocation = 'append' | 'prepend' | 'heading';

export interface TarotPracticeSettings {
	useDailyNote: boolean;
	dailyNotePathPattern: string;
	insertLocation: InsertLocation;
	headingName: string;
}

export const DEFAULT_SETTINGS: TarotPracticeSettings = {
	useDailyNote: true,
	dailyNotePathPattern: 'YYYY-MM-DD.md',
	insertLocation: 'append',
	headingName: '## Tarot'
};
