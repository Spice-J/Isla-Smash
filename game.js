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
        
        // End game elements
        this.endScreen = document.getElementById('end-screen');
        this.finalSmashCount = document.getElementById('final-smash-count');
        this.finalBonkCount = document.getElementById('final-bonk-count');
        this.exitButton = document.getElementById('exit-button');
        this.playAgainButton = document.getElementById('play-again-button');
        
        this.smashCounter = 0;
        this.dadBonkCounter = 0;
        this.isCleaning = false;
        this.dadVisible = false;
        this.momVisible = false;
        this.gameStartTime = null;
        this.dadSpawnStarted = false;
        this.momSpawnStarted = false;
        this.momLastAppearance = 0; // Track when mom last appeared
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
        
        // Exit button
        this.exitButton.addEventListener('click', () => this.endGame());
        this.exitButton.addEventListener('touchstart', () => this.endGame());
        
        // Play again button
        this.playAgainButton.addEventListener('click', () => this.restartGame());
        this.playAgainButton.addEventListener('touchstart', () => this.restartGame());
        
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
            this.sponge.style.bottom = '20px';
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
        const animationDuration = 2.5 + Math.random() * 1.5; // 2.5-4 seconds
        
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
        
        // Show bonk indicator
        const bonkIndicator = this.dadFace.querySelector('.bonk-indicator');
        bonkIndicator.classList.remove('hidden');
        
        // Change dad's image to bonked version
        const angryGeorge = document.getElementById('angry-george');
        const bonkedGeorge = document.getElementById('bonked-george');
        angryGeorge.classList.add('hidden');
        bonkedGeorge.classList.remove('hidden');
        
        // Random rotation (15 degrees left or right)
        const rotation = Math.random() > 0.5 ? 15 : -15;
        
        // Get current position to ensure proper fall animation
        const currentRect = this.dadFace.getBoundingClientRect();
        const gameRect = this.gameArea.getBoundingClientRect();
        const currentX = currentRect.left - gameRect.left;
        const currentY = currentRect.top - gameRect.top;
        
        // Set absolute position and animate dad falling
        this.dadFace.style.left = currentX + 'px';
        this.dadFace.style.top = currentY + 'px';
        this.dadFace.style.transition = 'transform 2s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
        this.dadFace.style.transform = `translateY(120vh) rotate(${rotation}deg)`;
        
        // Hide dad after animation
        setTimeout(() => {
            this.dadFace.classList.add('hidden');
            this.dadFace.style.transition = '';
            this.dadFace.style.transform = '';
            // Reset dad's image for next time
            const angryGeorge = document.getElementById('angry-george');
            const bonkedGeorge = document.getElementById('bonked-george');
            angryGeorge.classList.remove('hidden');
            bonkedGeorge.classList.add('hidden');
            // Hide bonk indicator
            const bonkIndicator = this.dadFace.querySelector('.bonk-indicator');
            bonkIndicator.classList.add('hidden');
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
        this.momLastAppearance = Date.now(); // Track when mom appears
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
        // Show mom every 30-45 seconds with 15-second cooldown
        const spawnMom = () => {
            const currentTime = Date.now();
            const timeSinceLastAppearance = currentTime - this.momLastAppearance;
            
            // Only show mom if enough time has passed (15 seconds minimum)
            if (!this.isCleaning && timeSinceLastAppearance >= 15000) {
                this.showMom();
                this.momLastAppearance = currentTime;
            }
            
            const nextSpawn = Math.random() * 15000 + 30000; // 30-45 seconds
            setTimeout(spawnMom, nextSpawn);
        };
        spawnMom();
    }
    
    playSound(type) {
        // Placeholder for sound effects
        // You can add actual audio files later
        console.log(`Playing ${type} sound`);
    }
    
    endGame() {
        console.log('Ending game');
        this.gameStarted = false;
        
        // Update final scores
        this.finalSmashCount.textContent = this.smashCounter;
        this.finalBonkCount.textContent = this.dadBonkCounter;
        
        // Hide game container and show end screen
        this.gameContainer.classList.add('hidden');
        this.endScreen.classList.remove('hidden');
        
        // Start fireworks
        this.startFireworks();
    }
    
    restartGame() {
        console.log('Restarting game');
        
        // Reset counters
        this.smashCounter = 0;
        this.dadBonkCounter = 0;
        this.smashCount.textContent = '0';
        this.dadBonks.textContent = '0';
        
        // Reset game state
        this.isCleaning = false;
        this.dadVisible = false;
        this.momVisible = false;
        this.dadSpawnStarted = false;
        this.momSpawnStarted = false;
        this.foodSpawningPaused = false;
        
        // Hide end screen and show start screen
        this.endScreen.classList.add('hidden');
        this.startScreen.classList.remove('hidden');
        
        // Clear any remaining game elements
        const foodItems = document.querySelectorAll('.food-item');
        foodItems.forEach(item => item.remove());
        
        // Reset sponge
        this.sponge.classList.remove('draggable');
        this.sponge.style.cursor = 'pointer';
        
        // Hide dad and mom
        this.dadFace.classList.add('hidden');
        this.momFace.classList.add('hidden');
    }
    
    startFireworks() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
        
        const createFirework = () => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            const color = colors[Math.floor(Math.random() * colors.length)];
            firework.style.backgroundColor = color;
            firework.style.left = Math.random() * window.innerWidth + 'px';
            
            // Add firework to the end screen instead of body
            this.endScreen.appendChild(firework);
            
            // Create particle burst after firework reaches its peak
            setTimeout(() => {
                this.createParticleBurst(firework, color);
                firework.remove(); // Remove the original firework
            }, 1800); // Start burst at 60% of the firework animation
        };
        
        // Create fireworks every 400ms for 5 seconds
        const fireworkInterval = setInterval(createFirework, 400);
        
        // Grand finale after 5 seconds
        setTimeout(() => {
            clearInterval(fireworkInterval);
            this.createGrandFinale();
        }, 5000);
    }
    
    createParticleBurst(firework, color) {
        const rect = firework.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create 20 particles in a burst
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.backgroundColor = color;
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            // Random direction for each particle
            const angle = (Math.PI * 2 * i) / 20; // Evenly distributed in a circle
            const distance = 50 + Math.random() * 100; // Random distance
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            
            this.endScreen.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1500);
        }
    }
    
    createGrandFinale() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#ffffff'];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Create a massive burst with particles going across the whole screen
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.boxShadow = '0 0 8px currentColor';
            
            // Random direction for each particle to cover the whole screen
            const angle = (Math.PI * 2 * i) / 50; // Evenly distributed in a circle
            const distance = 200 + Math.random() * 300; // Much larger distance for screen coverage
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            
            this.endScreen.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }
        
        // Create multiple smaller bursts around the center for extra effect
        setTimeout(() => {
            for (let burst = 0; burst < 3; burst++) {
                setTimeout(() => {
                    this.createMiniBurst(centerX + (Math.random() - 0.5) * 200, centerY + (Math.random() - 0.5) * 200);
                }, burst * 300);
            }
        }, 500);
    }
    
    createMiniBurst(x, y) {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
        
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            const angle = (Math.PI * 2 * i) / 15;
            const distance = 80 + Math.random() * 120;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            
            this.endScreen.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1500);
        }
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