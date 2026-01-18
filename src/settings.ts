export type InsertLocation = 'append' | 'prepend' | 'heading';

export interface TarotPracticeSettings {
	useDailyNote: boolean;
	dailyNotePathPattern: string;
	insertLocation: InsertLocation;
	headingName: string;
	outputTemplate: string;
	useSharedTemplate: boolean;
	inlineOutputTemplate: string;
	enableReversals: boolean;
	reversalChance: number;
	uprightIndicator: string;
	reversedIndicator: string;
	multipleCardsDefault: number;
	multipleCardsTemplate: string;
}

export const DEFAULT_TEMPLATE = `## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Card:** {{card}} {{orientation}}
**Index:** {{index}}
**Drawn at:** {{timestamp}}

---
`;

export const DEFAULT_MULTIPLE_TEMPLATE = `## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Cards drawn:** {{card_count}}

{{cards}}

**Drawn at:** {{timestamp}}

---
`;

export const DEFAULT_SETTINGS: TarotPracticeSettings = {
	useDailyNote: true,
	dailyNotePathPattern: 'YYYY-MM-DD.md',
	insertLocation: 'append',
	headingName: '## Tarot',
	outputTemplate: DEFAULT_TEMPLATE,
	useSharedTemplate: true,
	inlineOutputTemplate: DEFAULT_TEMPLATE,
	enableReversals: false,
	reversalChance: 50,
	uprightIndicator: '',
	reversedIndicator: 'reversed',
	multipleCardsDefault: 3,
	multipleCardsTemplate: DEFAULT_MULTIPLE_TEMPLATE
};
