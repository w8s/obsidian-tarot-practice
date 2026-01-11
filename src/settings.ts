export interface TarotPracticeSettings {
	useDailyNote: boolean;
	dailyNotePathPattern: string;
}

export const DEFAULT_SETTINGS: TarotPracticeSettings = {
	useDailyNote: true,
	dailyNotePathPattern: 'YYYY-MM-DD.md'
};
