# Isla Smash 🎮

A fun, child-friendly game for Isla to smash food items, bonk dad, and clean up with mom!

## How to Play

1. **Smash Food**: Tap/click on food items that pop up from the bottom of the screen
2. **Bonk Dad**: When dad's face appears, tap him to make him fall off screen
3. **Clean Up**: When mom appears, tap the sponge button to clean up all the mess

## Features

- ✅ Food items randomly spawn and float up the screen
- ✅ Tap to smash food with satisfying animations
- ✅ Dad's face occasionally appears for bonking
- ✅ Mom's face appears to trigger cleanup mode
- ✅ Sponge button for cleaning up smashed food
- ✅ Score tracking for smashes and bonks
- ✅ Responsive design for iPad and computer
- ✅ Touch-friendly controls
- ✅ Beautiful animations and child-friendly colors

## Adding Your Own Images

### Food Items
1. Replace the emoji arrays in `game.js`:
   ```javascript
   this.foodItems = ['🍎', '🍌', '🍊']; // Replace with your food images
   this.smashedFoodItems = ['🍎', '🍌', '🍊']; // Replace with smashed versions
   ```

2. To use actual images instead of emojis:
   ```javascript
   // In the createFoodItem() method, replace:
   foodItem.textContent = randomFood;
   
   // With:
   foodItem.innerHTML = '<img src="path/to/food-image.png" alt="food">';
   ```

### Dad's Face
1. Replace the emoji in `index.html`:
   ```html
   <div class="dad-image">👨</div>
   ```
   
2. With an image:
   ```html
   <div class="dad-image">
       <img src="path/to/dad-face.png" alt="Dad">
   </div>
   ```

### Mom's Face
1. Replace the emoji in `index.html`:
   ```html
   <div class="mom-image">👩</div>
   ```
   
2. With an image:
   ```html
   <div class="mom-image">
       <img src="path/to/mom-face.png" alt="Mom">
   </div>
   ```

### Sponge
1. Replace the emoji in `index.html`:
   ```html
   <div class="sponge-image">🧽</div>
   <div class="sponge-icon">🧽</div>
   ```
   
2. With images:
   ```html
   <div class="sponge-image">
       <img src="path/to/sponge.png" alt="Sponge">
   </div>
   <div class="sponge-icon">
       <img src="path/to/sponge-icon.png" alt="Sponge">
   </div>
   ```

## Adding Sound Effects

1. Add audio files to your project
2. Update the `playSound()` method in `game.js`:
   ```javascript
   playSound(type) {
       const audio = new Audio();
       switch(type) {
           case 'smash':
               audio.src = 'path/to/smash-sound.mp3';
               break;
           case 'bonk':
               audio.src = 'path/to/bonk-sound.mp3';
               break;
           case 'cleanup':
               audio.src = 'path/to/cleanup-sound.mp3';
               break;
       }
       audio.play();
   }
   ```

## Customizing Game Settings

### Timing Adjustments
In `game.js`, you can modify these values:

- **Food spawning**: `Math.random() * 2000 + 1000` (1-3 seconds)
- **Dad spawning**: `Math.random() * 7000 + 8000` (8-15 seconds)
- **Mom spawning**: `Math.random() * 10000 + 20000` (20-30 seconds)
- **Food animation duration**: 3000ms in `createFoodItem()`
- **Dad visibility duration**: 4000ms in `showDad()`
- **Mom visibility duration**: 3000ms in `showMom()`

### Visual Customizations
In `styles.css`, you can modify:
- Colors and gradients
- Sizes of elements
- Animation durations
- Background patterns

## Running the Game

1. Open `index.html` in a web browser
2. The game will start automatically
3. Works on both desktop and mobile devices

## Browser Compatibility

**⚠️ Recommended Browser: Chrome/Edge**

For the best experience, please use Chrome or Edge browsers. While the game works on Safari and Firefox, some features may not display optimally:

- **Chrome/Edge**: Full functionality with optimal performance
- **Safari**: May have font rendering issues and positioning quirks
- **Firefox**: Generally works well
- **Mobile browsers**: iOS Safari may have positioning issues; Chrome Mobile recommended

### Safari Users
If you're experiencing issues on Safari (especially with font rendering or element positioning), please try using Chrome or Edge for the best gameplay experience.

## Tips for Best Experience

1. **Images**: Use PNG format with transparent backgrounds for best results
2. **Sizes**: Keep images around 80x80px for food items, 120x120px for faces
3. **Touch**: Test on actual iPad for best touch experience
4. **Performance**: Optimize images for web (compress if needed)

## File Structure

```
isla-smash/
├── index.html      # Main game page
├── styles.css      # Game styling and animations
├── game.js         # Game logic and mechanics
└── README.md       # This file
```

## Future Enhancements

- Add more food types
- Include sound effects
- Add particle effects for smashing
- Create different dad/mom expressions
- Add background music
- Save high scores
- Add difficulty levels

Enjoy watching Isla have fun smashing and bonking! 🎉 