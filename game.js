class IslaSmashGame {
    constructor() {
        this.startScreen = document.getElementById('start-screen');
        this.gameContainer = document.getElementById('game-container');
        this.playButton = document.getElementById('play-button');
        this.gameArea = document.getElementById('game-area');
        this.dadFace = document.getElementById('dad-face');
        this.momFace = document.getElementById('mom-face');
        this.sponge = document.getElementById('sponge');
        this.smashCount = document.getElementById('smash-count');
        this.dadBonks = document.getElementById('dad-bonks');
        
        this.smashCounter = 0;
        this.dadBonkCounter = 0;
        this.isCleaning = false;
        this.dadVisible = false;
        this.momVisible = false;
        this.gameStartTime = null;
        this.dadSpawnStarted = false;
        this.momSpawnStarted = false;
        this.gameStarted = false;
        
        // Sponge dragging variables
        this.isDraggingSponge = false;
        this.spongeDragStart = { x: 0, y: 0 };
        this.spongeOffset = { x: 0, y: 0 };
        
        // Food emojis (you can replace these with actual images later)
        this.foodItems = ['🍎', '🍌', '🍊', '🍓', '🍇', '🍉', '🍍', '🥝', '🥭', '🍑'];
        // Smashed versions (using splat or similar emojis for now)
        this.smashedFoodItems = ['💥', '💫', '💦', '🫧', '💢', '💣', '🧨', '💨', '🩸', '🫗']; // Replace with real smashed food images later
        
        // Dad's speech messages
        this.dadMessages = [
            "Stop smashing!",
            "Isla, you're making a mess!",
            "What a disaster!",
            "Look at this mess!",
            "Isla, please stop!",
            "Oh no, what have you done?",
            "This is getting out of hand!",
            "Isla, be careful!"
        ];
        
        // Mom's speech messages
        this.momMessages = [
            "Isla, time to clean up!",
            "Let's tidy up this mess!",
            "Can you help clean up?",
            "Time to get the sponge!",
            "Isla, please clean up!",
            "Let's make it neat again!",
            "Time for some cleaning!",
            "Can you wipe this up?"
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        // Don't start the game automatically - wait for play button
    }
    
    startGame() {
        console.log('Game starting!');
        this.gameStarted = true;
        this.gameStartTime = Date.now();
        this.startScreen.classList.add('hidden');
        this.gameContainer.classList.remove('hidden');
        this.startFoodSpawning();
        this.checkDadSpawn();
        this.checkMomSpawn();
        console.log('Game started successfully');
    }
    
    setupEventListeners() {
        // Play button click
        this.playButton.addEventListener('click', () => this.startGame());
        this.playButton.addEventListener('touchstart', () => this.startGame());
        
        // Game area click/touch for food smashing
        this.gameArea.addEventListener('click', (e) => this.handleGameAreaClick(e));
        this.gameArea.addEventListener('touchstart', (e) => this.handleGameAreaClick(e));
        
        // Dad face click/touch
        this.dadFace.addEventListener('click', (e) => this.handleDadClick(e));
        this.dadFace.addEventListener('touchstart', (e) => this.handleDadClick(e));
        
        // Sponge events
        this.sponge.addEventListener('click', (e) => {
            console.log('Sponge clicked!');
            e.stopPropagation();
        });
        this.sponge.addEventListener('mousedown', (e) => this.startSpongeDrag(e));
        this.sponge.addEventListener('touchstart', (e) => this.startSpongeDrag(e));
        document.addEventListener('mousemove', (e) => this.dragSponge(e));
        document.addEventListener('touchmove', (e) => this.dragSponge(e));
        document.addEventListener('mouseup', () => this.stopSpongeDrag());
        document.addEventListener('touchend', () => this.stopSpongeDrag());
        
        // Prevent context menu on right click
        this.gameArea.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    startSpongeDrag(e) {
        console.log('Sponge clicked!', {
            momVisible: this.momVisible,
            isCleaning: this.isCleaning,
            isDraggingSponge: this.isDraggingSponge
        });
        
        // Only allow dragging when mom is visible (which means cleanup is needed)
        if (!this.momVisible) {
            console.log('Sponge not draggable - mom not visible');
            return;
        }
        
        console.log('Starting sponge drag');
        e.preventDefault();
        e.stopPropagation();
        this.isDraggingSponge = true;
        
        const rect = this.sponge.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        this.spongeOffset.x = clientX - rect.left;
        this.spongeOffset.y = clientY - rect.top;
        
        console.log('Sponge offset:', this.spongeOffset);
        this.sponge.style.cursor = 'grabbing';
    }
    
    dragSponge(e) {
        if (!this.isDraggingSponge) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        const gameRect = this.gameArea.getBoundingClientRect();
        const newX = clientX - gameRect.left - this.spongeOffset.x;
        const newY = clientY - gameRect.top - this.spongeOffset.y;
        
        // Keep sponge within game area bounds
        const spongeSize = 70;
        const clampedX = Math.max(0, Math.min(newX, gameRect.width - spongeSize));
        const clampedY = Math.max(0, Math.min(newY, gameRect.height - spongeSize));
        
        console.log('Dragging sponge to:', { x: clampedX, y: clampedY });
        
        this.sponge.style.left = `${clampedX}px`;
        this.sponge.style.top = `${clampedY}px`;
        this.sponge.style.bottom = '';
        this.sponge.style.transform = 'none';
        
        // Check for collision with smashed items
        this.checkSpongeCollision();
    }
    
    stopSpongeDrag() {
        if (this.isDraggingSponge) {
            this.isDraggingSponge = false;
            this.sponge.style.cursor = 'grab';
            
            // Return sponge to original position
            this.sponge.style.left = '50%';
            this.sponge.style.bottom = '110px';
            this.sponge.style.top = '';
            this.sponge.style.transform = 'translateX(-50%)';
        }
    }
    
    checkSpongeCollision() {
        const spongeRect = this.sponge.getBoundingClientRect();
        const smashedItems = document.querySelectorAll('.food-item.smashed');
        
        smashedItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            
            // Check if sponge overlaps with smashed item
            if (this.rectsOverlap(spongeRect, itemRect)) {
                // Remove the smashed item with a fade effect
                item.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => {
                    if (item.parentNode) {
                        item.parentNode.removeChild(item);
                    }
                }, 300);
            }
        });
    }
    
    rectsOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    checkDadSpawn() {
        if (!this.gameStarted) return;
        
        const gameTime = Date.now() - this.gameStartTime;
        
        if (gameTime >= 15000 && !this.dadSpawnStarted) { // 15 seconds
            this.dadSpawnStarted = true;
            this.startDadSpawning();
        } else if (!this.dadSpawnStarted) {
            setTimeout(() => this.checkDadSpawn(), 1000);
        }
    }
    
    checkMomSpawn() {
        if (!this.gameStarted) return;
        
        if (this.smashCounter >= 10 && !this.momSpawnStarted) {
            this.momSpawnStarted = true;
            this.startMomSpawning();
        } else if (!this.momSpawnStarted) {
            setTimeout(() => this.checkMomSpawn(), 1000);
        }
    }
    
    handleGameAreaClick(e) {
        if (this.isCleaning) return;
        
        const target = e.target;
        if (target.classList.contains('food-item') && !target.classList.contains('smashed')) {
            this.smashFood(target);
        }
    }
    
    handleDadClick(e) {
        if (this.isCleaning || !this.dadVisible) return;
        
        e.stopPropagation();
        this.bonkDad();
    }
    
    createFoodItem() {
        if (this.isCleaning || !this.gameStarted) return;
        
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        
        // Random food emoji
        const randomFood = this.foodItems[Math.floor(Math.random() * this.foodItems.length)];
        foodItem.textContent = randomFood;
        
        // Random position
        const x = Math.random() * (this.gameArea.offsetWidth - 80);
        foodItem.style.left = x + 'px';
        foodItem.style.bottom = '-80px';
        
        // Random peak height (between 30% and 80% of screen height)
        const peakHeight = Math.random() * 50 + 30; // 30% to 80% of screen height
        const animationDuration = 4 + Math.random() * 2; // 4-6 seconds
        
        // Create custom gravity animation
        foodItem.style.animation = 'none';
        foodItem.style.transition = `transform ${animationDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        
        this.gameArea.appendChild(foodItem);
        
        // Start the gravity animation after a small delay
        setTimeout(() => {
            if (foodItem.parentNode && !foodItem.classList.contains('smashed')) {
                // Move to peak height
                foodItem.style.transform = `translateY(-${peakHeight}vh)`;
                
                // After reaching peak, start falling
                setTimeout(() => {
                    if (foodItem.parentNode && !foodItem.classList.contains('smashed')) {
                        foodItem.style.transition = `transform 2s cubic-bezier(0.55, 0.055, 0.675, 0.19)`;
                        foodItem.style.transform = `translateY(100vh)`;
                    }
                }, animationDuration * 1000 * 0.6); // Start falling at 60% of the way up
            }
        }, 100);
        
        // Remove food item after total animation completes
        setTimeout(() => {
            if (foodItem.parentNode && !foodItem.classList.contains('smashed')) {
                foodItem.parentNode.removeChild(foodItem);
            }
        }, (animationDuration + 2) * 1000);
    }
    
    smashFood(foodElement) {
        // Swap to smashed emoji
        const original = foodElement.textContent;
        const idx = this.foodItems.indexOf(original);
        if (idx !== -1) {
            foodElement.textContent = this.smashedFoodItems[idx % this.smashedFoodItems.length];
        } else {
            foodElement.textContent = '💥';
        }
        foodElement.classList.add('smashed');
        this.smashCounter++;
        this.smashCount.textContent = this.smashCounter;
        this.playSound('smash');

        // Capture current position on the screen
        const rect = foodElement.getBoundingClientRect();
        const parentRect = this.gameArea.getBoundingClientRect();
        // Calculate position relative to game area
        const left = rect.left - parentRect.left;
        const top = rect.top - parentRect.top;

        // Set absolute position and remove transforms/animations
        foodElement.style.transition = 'none';
        foodElement.style.transform = 'none';
        foodElement.style.left = `${left}px`;
        foodElement.style.top = `${top}px`;
        foodElement.style.bottom = 'auto';
        foodElement.style.position = 'absolute';
        foodElement.style.zIndex = 5;
    }
    
    bonkDad() {
        console.log('Bonking dad!');
        this.dadBonkCounter++;
        this.dadBonks.textContent = this.dadBonkCounter;
        this.dadVisible = false;
        
        // Play bonk sound effect
        this.playSound('bonk');
        
        // Hide speech bubble immediately
        const speechBubble = this.dadFace.querySelector('.speech-bubble');
        speechBubble.classList.add('hidden');
        
        // Change dad's image to bonked version
        const dadImage = this.dadFace.querySelector('.dad-image');
        dadImage.textContent = '😵'; // Bonked dad emoji
        
        // Random rotation (15 degrees left or right)
        const rotation = Math.random() > 0.5 ? 15 : -15;
        
        // Animate dad falling like food items
        this.dadFace.style.transition = 'transform 2s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
        this.dadFace.style.transform = `translateY(120vh) rotate(${rotation}deg)`;
        
        // Hide dad after animation
        setTimeout(() => {
            this.dadFace.classList.add('hidden');
            this.dadFace.style.transition = '';
            this.dadFace.style.transform = '';
            // Reset dad's image for next time
            dadImage.textContent = '👨';
        }, 2000);
    }
    
    showDad() {
        if (this.isCleaning || this.dadVisible) return;
        
        this.dadVisible = true;
        this.dadFace.classList.remove('hidden');
        
        // Show random speech bubble first to calculate its height
        const speechBubble = this.dadFace.querySelector('.speech-bubble');
        const speechText = this.dadFace.querySelector('.speech-text');
        const randomMessage = this.dadMessages[Math.floor(Math.random() * this.dadMessages.length)];
        
        speechText.textContent = randomMessage;
        speechBubble.classList.remove('hidden');
        
        // Calculate bounds to ensure face and speech bubble are fully visible
        const faceWidth = 120;
        const faceHeight = 120;
        const bubbleHeight = speechBubble.offsetHeight + 20; // Actual bubble height + padding
        const padding = 20; // Extra padding from edges
        
        // Available area considering speech bubble above
        const maxX = this.gameArea.offsetWidth - faceWidth - padding;
        const maxY = this.gameArea.offsetHeight - faceHeight - bubbleHeight - padding;
        const minX = padding;
        const minY = bubbleHeight + padding; // Ensure dad is never too high for speech bubble
        
        // Random position within safe bounds
        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - minY) + minY;
        
        console.log('Dad position:', { x, y, maxX, maxY, minX, minY, bubbleHeight });
        
        this.dadFace.style.left = x + 'px';
        this.dadFace.style.top = y + 'px';
        
        // Dad stays until bonked - no timeout
    }
    
    showMom() {
        if (this.isCleaning || this.momVisible) return;
        
        console.log('Mom appearing!');
        this.momVisible = true;
        this.momFace.classList.remove('hidden');
        
        // Show random speech bubble
        const speechBubble = this.momFace.querySelector('.speech-bubble');
        const speechText = this.momFace.querySelector('.speech-text');
        const randomMessage = this.momMessages[Math.floor(Math.random() * this.momMessages.length)];
        
        speechText.textContent = randomMessage;
        speechBubble.classList.remove('hidden');
        
        // Pause food spawning
        this.foodSpawningPaused = true;
        console.log('Food spawning paused');
        
        // Enable sponge dragging
        this.sponge.classList.add('draggable');
        this.sponge.style.cursor = 'grab';
        console.log('Sponge made draggable');
        
        // Start checking if cleanup is complete
        this.checkCleanupComplete();
    }
    
    checkCleanupComplete() {
        if (!this.momVisible) return;
        
        const smashedItems = document.querySelectorAll('.food-item.smashed');
        console.log('Checking cleanup - smashed items remaining:', smashedItems.length);
        
        if (smashedItems.length === 0) {
            // All smashed items are cleaned, hide mom and resume game
            console.log('Cleanup complete! Hiding mom and resuming game');
            
            // Hide mom's speech bubble
            const speechBubble = this.momFace.querySelector('.speech-bubble');
            speechBubble.classList.add('hidden');
            
            this.momFace.classList.add('hidden');
            this.momVisible = false;
            this.sponge.classList.remove('draggable');
            this.sponge.style.cursor = 'pointer';
            this.foodSpawningPaused = false;
        } else {
            // Still have smashed items, check again in 1 second
            setTimeout(() => this.checkCleanupComplete(), 1000);
        }
    }
    
    startFoodSpawning() {
        console.log('Starting food spawning');
        // Spawn food every 1-3 seconds
        const spawnFood = () => {
            if (!this.isCleaning && this.gameStarted && !this.foodSpawningPaused) {
                console.log('Creating food item');
                this.createFoodItem();
            } else {
                console.log('Food spawning blocked:', {
                    isCleaning: this.isCleaning,
                    gameStarted: this.gameStarted,
                    foodSpawningPaused: this.foodSpawningPaused
                });
            }
            const nextSpawn = Math.random() * 2000 + 1000; // 1-3 seconds
            setTimeout(spawnFood, nextSpawn);
        };
        spawnFood();
    }
    
    startDadSpawning() {
        // Show dad every 8-15 seconds
        const spawnDad = () => {
            if (!this.isCleaning) {
                this.showDad();
            }
            const nextSpawn = Math.random() * 7000 + 8000; // 8-15 seconds
            setTimeout(spawnDad, nextSpawn);
        };
        spawnDad();
    }
    
    startMomSpawning() {
        // Show mom every 20-30 seconds
        const spawnMom = () => {
            if (!this.isCleaning) {
                this.showMom();
            }
            const nextSpawn = Math.random() * 10000 + 20000; // 20-30 seconds
            setTimeout(spawnMom, nextSpawn);
        };
        spawnMom();
    }
    
    playSound(type) {
        // Placeholder for sound effects
        // You can add actual audio files later
        console.log(`Playing ${type} sound`);
    }


}

// Add fadeOut animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0.5);
        }
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new IslaSmashGame();
}); 