export type InsertLocation = 'append' | 'prepend' | 'heading';

import { Spread } from './spreads';

export interface TarotPracticeSettings {
	useDailyNote: boolean;
	dailyNotePathPattern: string;
	insertLocation: InsertLocation;
	headingName: string;
	dailyCardCount: number;
	shuffleCount: number;
	cutDeck: boolean;
	enableReversals: boolean;
	reversalChance: number;
	uprightIndicator: string;
	reversedIndicator: string;
	
	// File-based templates (v1.3.0+)
	useCustomDailyTemplate: boolean;
	customDailyTemplatePath: string;
	useCustomInlineTemplate: boolean;
	customInlineTemplatePath: string;
	useCustomMultipleTemplate: boolean;
	customMultipleTemplatePath: string;
	
	// Template organization (v1.4.0+)
	templateBaseFolder: string;
	
	// Spreads (v1.4.0+)
	customSpreads: Spread[];
	
	// Migration flag
	hasTemplatesMigrated: boolean;
	
	// DEPRECATED: Kept for backward compatibility and migration
	// Will be removed in v2.0.0
	outputTemplate?: string;
	useSharedTemplate?: boolean;
	inlineOutputTemplate?: string;
	multipleCardsTemplate?: string;
}

export const DEFAULT_TEMPLATE = `## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Card:** {{card}} {{orientation}}
**Index:** {{index}}

---
`;

export const DEFAULT_MULTIPLE_TEMPLATE = `## Tarot draw - {{datetime}}

**Intention:** {{intention}}
**Cards drawn:** {{card_count}}

{{cards}}

---
`;

export const DEFAULT_SETTINGS: TarotPracticeSettings = {
	useDailyNote: true,
	dailyNotePathPattern: 'YYYY-MM-DD.md',
	insertLocation: 'append',
	headingName: '## Tarot',
	dailyCardCount: 1,
	shuffleCount: 3,
	cutDeck: true,
	enableReversals: false,
	reversalChance: 50,
	uprightIndicator: '',
	reversedIndicator: 'reversed',
	
	// File-based templates (v1.3.0+)
	useCustomDailyTemplate: false,
	customDailyTemplatePath: '',
	useCustomInlineTemplate: false,
	customInlineTemplatePath: '',
	useCustomMultipleTemplate: false,
	customMultipleTemplatePath: '',
	
	// Template organization (v1.4.0+)
	templateBaseFolder: 'Templates/Tarot',
	
	// Spreads (v1.4.0+)
	customSpreads: [],
	
	// Migration flag
	hasTemplatesMigrated: false,
	
	// DEPRECATED: Keep for migration
	outputTemplate: DEFAULT_TEMPLATE,
	useSharedTemplate: true,
	inlineOutputTemplate: DEFAULT_TEMPLATE,
	multipleCardsTemplate: DEFAULT_MULTIPLE_TEMPLATE
};
