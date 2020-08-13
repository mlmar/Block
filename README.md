# Block
A game where you control a block in order dodge other blocks.
- WASD/Arrow key movement
- Hosted on github pages -- no backend for highscores
- Special blocks to help survival
- __Mobile__: needs to run in a safari standalone ("add to home screen option")
  - issue: safari standalone has a 300ms delay between each click
  - partial solution: ued FT Lab's fastclick.jss to alleviate the delay on IOS but it still exists to an extent

### Starter
There are three lines of code in Starter.js that is used to setup the game.

    resetValues(); // resets to default values (or user specified value)
    setLevelTick(20); // score per level, it bugs out when less than 20
    startScreen(); // just shows helper blocks, not super necessary

After running these three lines, _reset()_ can be called to start the game.

#### Primary files
- Game.js: rendering, start/stop, gameloop, randomizer functions
- Levels.js: controls gameflow per each level/gamemdoe
- Mobile.js: listeners for mobile controls/fastclick.js
- Starter.js: initializes the game with default settings for each gamemode

- popup.css
	- used for hiding/showing mobile controls and settings menu

#### Bugs
- Grabbing a blue "slow" block right before a speed change will retain old speed