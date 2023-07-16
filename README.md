# ⚠️  WORK IN PROGRESS ⚠️ 

# Mark

Fast, easy, simple, cross-platform markdown viewing.

### Features:

- 🛩️ Small
- ⚡ Performant
- 📡 Live updates
- ⌨️ Keyboard Driven
- 📑 Multiple Files
- ⬇️ Markdown files only file picker
- 🐙 Full CommonMark + GitHub Flavored Markdown (GFM) support.

## Open files from the terminal

```bash
    mark ./file1.md ./file2.md ...
```

## Keyboard Bindings

| shortcut                             | action               |
| ------------------------------------ | -------------------- |
| <kbd>H</kbd> \| <kbd>SHIFT + ←</kbd> | Previous File        |
| <kbd>L</kbd> \| <kbd>SHIFT + →</kbd> | Next File            |
| <kbd>h</kbd> \| <kbd>←</kbd>         | Scroll Page Left     |
| <kbd>l</kbd> \| <kbd>→</kbd>         | Scroll Page Right    |
| <kbd>k</kbd> \| <kbd>↑</kbd>         | Scroll Page Up       |
| <kbd>j</kbd> \| <kbd>↓</kbd>         | Scroll Page Down     |
| <kbd>f</kbd>                         | Open File Picker     |
| <kbd>c</kbd>                         | Close File           |
| <kbd>o</kbd> + Link ID               | Open Link            |
| <kbd>q</kbd>                         | Exit the Application |
| <kbd>e</kbd>                         | Edit the file        |
| <kbd>?</kbd>                         | View Shortcuts       |

# Maybe Additional Features

- Add support for [[./some/path]] based routing.
- Add option to open file in github.com if it originates from there.

# TODO

### Front-end

- [x] Implement keyboard shortcuts.
- [x] Error Handling
- [x] Notification System
- [x] Shortcut Guide
- [x] Multi-file widget thing
- [x] CSS refactor
- [x] Option to "stick to bottom"
- [x] Option to switch to the file that changed.
- [x] Remove tailwindcss but keep postcss
- [ ] Make it obvious when there are no files to search.
- [ ] Set default font.

- [ ] Rewrite in elm? => yes.
- [ ] Rewrite styles in tailwindcss => yes.
- [ ] Allow for light/dark theme switching.


### Back-end

- [x] Implement `remove-file`
- [x] Flush out client-backend interface // invokes & listeners
- [x] Error Handling
- [x] Refactor & Optimize
- [ ] Test behavior when the watcher fails.

### Both

- [ ] Links seem to be broken
- [ ] Links starting with "/..." should be prepended with github.com or something.
- [ ] Open with default applicaiton seems to be broken.
