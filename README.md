this is vibecoded slop

# Subway Surfers gameplay overlay

This is a small Electron viewer that stays above other windows and displays vertical phone-format Subway Surfers gameplay streamed from YouTube. It does not implement or clone the game.

## Run

1. Install Node.js.
2. In this folder, run `npm install`.
3. Run `npm start`.

The app opens directly to a portrait player with no controls or title bar. The window can be resized while maintaining the 9:16 phone aspect ratio and moved by dragging inside the player. The video loops automatically. Close it with `Alt+F4`.

## Settings

Press `Ctrl+Shift+S` to open the settings menu. It can configure the YouTube video URL, always-on-top behavior, and window opacity. Settings are stored locally.
