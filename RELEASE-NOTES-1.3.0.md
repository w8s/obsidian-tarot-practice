# v1.3.0 - File-Based Template System

## 🎉 Highlights

**File-Based Templates**: Templates are now stored as files in your vault instead of inline text editors. This brings several benefits:
- ✨ Edit templates using your favorite Markdown editor
- 🔗 Works seamlessly with Templater plugin and other template tools
- 📁 Organize templates alongside your other vault content
- 🔄 Easy sharing and version control of templates
- 🎯 Automatic migration from v1.2.0 inline templates

**Better User Experience**:
- Clear modal titles show context ("Daily tarot draw", "Inline tarot draw", etc.)
- Simplified settings with show/hide toggles
- Unified modal component for cleaner code

## ✨ What's New

### File-Based Templates
- **Built-in defaults**: Works out of the box with sensible defaults
- **Custom templates**: Choose template files from your vault with autocomplete
- **Auto-detection**: Automatically detects your Templates folder (Templater/Core Templates/common conventions)
- **Three separate templates**: Daily practice, inline draws, and multiple cards can each use different templates

### Automatic Migration
- First-time users see built-in templates immediately
- Existing users with customized templates get a migration wizard
- Templates are copied to `Templates/Tarot/` folder (or your custom location)
- No data loss - original settings preserved

### UI Improvements
- Modal titles now reflect context:
  - "Daily tarot draw" for daily practice
  - "Inline tarot draw" for single inline draws
  - "Inline draw multiple cards" for multiple inline draws
- Settings toggles show/hide file pickers for cleaner interface

## 🔄 What Changed

### Templates
- **Before**: Three text editors in settings for template content
- **After**: Toggle + file picker for each template type
- **Benefit**: Edit templates in your vault, use with other plugins

### Sharing Templates
- **Before**: "Use shared template" toggle to reuse daily template for inline
- **After**: Point both template settings to the same file
- **Benefit**: More flexible, clearer intent

### Modal Component
- **Before**: Separate modals for single/multiple cards
- **After**: One unified modal handles all cases
- **Benefit**: Consistent UX, easier maintenance

## 🚀 Migration Guide

### For New Users
Just install and use! Built-in templates work immediately.

### For Existing Users (v1.2.0)

**If you haven't customized templates:**
Nothing to do! The plugin will use new built-in defaults that match v1.2.0 behavior.

**If you have customized templates:**
1. First time opening settings after update, you'll see a migration wizard
2. Choose where to save templates (auto-detects your Templates folder)
3. Click "Migrate" - your custom templates are copied to files
4. Settings automatically update to use the new template files
5. Your original settings are preserved for rollback if needed

**Manual migration (if wizard fails):**
1. Copy your template content from old settings
2. Create new files in your vault (e.g., `Templates/Tarot/Daily.md`)
3. Paste template content
4. In settings, toggle "Use custom template" and select your file

## 📋 Technical Details

### New Files
- `src/BuiltInTemplates.ts` - Default template constants
- `src/TemplateResolver.ts` - Load templates from files or built-ins
- `src/TemplateMigrator.ts` - Migrate v1.2.0 inline templates
- `src/TemplateMigrationModal.ts` - Migration wizard UI
- `src/TemplateFolderDetector.ts` - Auto-detect Templates folder
- `src/FileSuggest.ts` - File autocomplete in settings

### Deprecated (kept for compatibility)
- `outputTemplate` setting (use file-based daily template)
- `inlineOutputTemplate` setting (use file-based inline template)
- `multipleCardsTemplate` setting (use file-based multiple template)
- `useSharedTemplate` setting (point templates to same file instead)

These fields remain in settings data but are no longer used. They'll be removed in v2.0.0.

## 🐛 Bug Fixes

- Fixed: Inline draws now correctly use inline template instead of daily template
- Fixed: Duplicate JSDoc comment in TemplateMigrator

## 📦 Installation

### From GitHub Release
1. Download `main.js`, `manifest.json`, and `styles.css` from this release
2. Create folder: `YourVault/.obsidian/plugins/tarot-practice/`
3. Copy the three files into that folder
4. Reload Obsidian
5. Enable "Tarot Practice" in Settings → Community Plugins

### Updating from v1.2.0
1. Replace `main.js`, `manifest.json`, and `styles.css` in your plugin folder
2. Reload Obsidian
3. Open Settings → Tarot Practice
4. Follow migration wizard if you have custom templates

## 📊 Stats

- **19 files changed**
- **+986 insertions, -547 deletions**
- **Bundle size**: 27 KB (main.js)
- **Total artifacts**: 28 KB

## 🙏 Acknowledgments

Thanks to all testers and users who provided feedback on template customization!

---

**Full Changelog**: https://github.com/w8s/obsidian-tarot-practice/compare/1.2.0...1.3.0
