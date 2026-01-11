export type InsertLocation = 'append' | 'prepend' | 'heading';

export interface TarotPracticeSettings {
	useDailyNote: boolean;
	dailyNotePathPattern: string;
	insertLocation: InsertLocation;
	headingName: string;
	outputTemplate: string;
}

export const DEFAULT_TEMPLATE = `## Tarot Draw - {{datetime}}

**Intention:** {{intention}}
**Card:** {{card}} (Index: {{index}})
**Drawn at:** {{timestamp}}

---
`;

export const DEFAULT_SETTINGS: TarotPracticeSettings = {
	useDailyNote: true,
	dailyNotePathPattern: 'YYYY-MM-DD.md',
	insertLocation: 'append',
	headingName: '## Tarot',
	outputTemplate: DEFAULT_TEMPLATE
};
