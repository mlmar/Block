# Block
A game where you control a block in order dodge other blocks.
- WASD/Arrow key movement
- Hosted on github pages -- no backend for highscores
- Special blocks to help survival

#### Primary files
- Game.js: rendering, start/stop, gameloop, randomizer functions
- Levels.js: controls gameflow per each level/gamemdoe
- Mobile.js: listeners for mobile controls/fastclick.js
- Starter.js: initializes the game with default settings for each gamemode

- popup.css
	- used for hiding/showing mobile controls and settings menu

#### Bugs
- Grabbing a blue "slow" block right before a speed change will retain old speed

#### External Resources Used
- FT Lab's fastclick.js to byass 300ms delay between each click specifically in safari's standalone app feature
