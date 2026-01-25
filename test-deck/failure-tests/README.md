# Failure Test Cases for ZIP Deck Import

This directory contains test ZIPs designed to trigger various error conditions.

## Test Files

### 1. `no-deck-json.zip`
**Expected Error:** "ZIP must contain deck.json in root"
**Contains:** A readme.txt file but no deck.json
**Tests:** Missing required deck.json file detection

### 2. `invalid-json.zip`
**Expected Error:** "Failed to parse deck JSON: ..." (JSON parse error)
**Contains:** A deck.json with malformed JSON syntax
**Tests:** JSON parsing error handling

### 3. `invalid-deck.zip`
**Expected Error:** "Invalid deck: Missing or invalid required field: supportsReversals..."
**Contains:** A deck.json that fails validation (missing required fields)
**Tests:** Deck validation error handling

### 4. `corrupted.zip`
**Expected Error:** JSZip error (cannot load archive)
**Contains:** A text file pretending to be a ZIP
**Tests:** Corrupted ZIP file handling

## Successful Test File

### `../rider-waite-smith-images.zip`
**Expected:** Success! Deck installed with 78 cards and images
**Contains:** Complete valid deck.json + 79 image files (78 cards + cover)
**Tests:** Full successful import with images

## Testing Instructions

1. Import each failure test ZIP via Settings → Deck Management → "Add deck"
2. Verify each shows an appropriate error message
3. Verify plugin doesn't crash
4. Verify no partial files are left in the decks directory
5. Import the successful ZIP to verify normal operation still works

## Duplicate Deck Test

After successfully importing `rider-waite-smith-images.zip`, try importing it again.
**Expected Error:** "Deck 'rider-waite-smith-images' already exists"
