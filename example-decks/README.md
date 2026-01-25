# Example Divination Decks

This directory contains public domain divination decks that can be installed in the Tarot Practice plugin.

## Available Decks

### Elder Futhark Runes (24 runes)
**File:** `elder-futhark.json`

The oldest form of the runic alphabets, used by Germanic peoples from the 2nd to 8th centuries CE. The 24 runes are organized into three aettir (families):
- **Freyr's Aett** (Fehu through Wunjo) - Creation, prosperity, love
- **Heimdall's Aett** (Hagalaz through Sowilo) - Change, transformation, chaos
- **Tyr's Aett** (Tiwaz through Othala) - Spiritual matters, honor, heritage

Runes are typically drawn one at a time or cast in groups. Reversals are commonly used.

### Petit Lenormand (36 cards)
**File:** `lenormand.json`

Named after the famous French fortune teller Mademoiselle Lenormand (1772-1843), this system derives from the German "Game of Hope" card game. Each card combines:
- A symbolic image (Rider, Clover, Ship, etc.)
- A playing card suit and rank
- A sequential number (1-36)

Lenormand readings focus on combinations of cards rather than individual card meanings. Common spreads include the Grand Tableau (all 36 cards) and smaller 3-9 card layouts.

### Playing Card Cartomancy (52 cards)
**File:** `playing-cards.json`

Standard playing card divination, dating back to 14th century Europe and popularized in the 18th-19th centuries. The four suits represent:
- **Hearts** - Love, emotions, relationships, home
- **Diamonds** - Money, resources, work, material concerns
- **Clubs** - Passion, creativity, inspiration, action
- **Spades** - Challenges, obstacles, difficulties, truth

Cartomancy is known for providing direct, straightforward answers. No reversals used.

### I Ching / Book of Changes (64 hexagrams)
**File:** `i-ching.json`

The ancient Chinese divination system, over 3,000 years old. Each of the 64 hexagrams is formed from six lines (either broken yin or unbroken yang). Hexagrams represent different life situations and changes.

Traditionally consulted by:
- Casting three coins six times
- Dividing yarrow stalks
- Random selection (modern method)

Each hexagram has deep philosophical meaning and can include "changing lines" for additional insight.

## Installation

1. Open Obsidian Settings → Tarot Practice → Deck Management
2. Click "Add deck"
3. Select the desired `.json` file
4. The deck will be validated and installed

## Creating Your Own Deck

Use these files as templates! The required structure is:

```json
{
  "id": "unique-deck-id",
  "name": "Display Name",
  "description": "Description of the deck",
  "cards": [
    {
      "index": 0,
      "name": "Card Name",
      "category": "Category or null",
      "suit": "Suit or null",
      "rank": "Rank or null",
      "value": "Value or null",
      "imageUrl": "cards/00-card-name.png"
    }
  ],
  "cardCount": 24,
  "supportsReversals": true,
  "isBuiltIn": false,
  "backImageUrl": "back.png",
  "metadata": {
    "author": "Creator Name",
    "year": 2025,
    "publisher": "Publisher",
    "tradition": "tarot|oracle|lenormand|playing-cards|runes|other"
  }
}
```

### Optional Image Support

Decks can include images for visual spreads:

**Card images:**
- Add `"imageUrl": "path/to/image.png"` to each card
- Paths can be relative to deck directory or vault paths
- Use in templates with `{{card.image}}` or `{{card.imageUrl}}`

**Deck back image:**
- Add `"backImageUrl": "back.png"` at deck level
- Use in templates with `{{deck_back_image}}` or `{{deck_back_image_url}}`

**Example with images:**
```json
{
  "id": "my-oracle",
  "name": "My Oracle Deck",
  "backImageUrl": "assets/deck-back.png",
  "cards": [
    {
      "index": 0,
      "name": "The Seeker",
      "imageUrl": "assets/cards/00-seeker.png"
    }
  ]
}
```

## Public Domain Status

These decks are based on historical divination systems that are in the public domain:
- **Elder Futhark runes** - 2nd-8th centuries CE
- **Lenormand system** - Early 1800s
- **Playing card cartomancy** - 14th century Europe onwards
- **I Ching** - Over 3,000 years old (ancient China)

All systems are freely available for use, study, and distribution.
