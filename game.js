const synth = window.speechSynthesis;

class IslaSmashGame {
  constructor() {
    this.startScreen = document.getElementById("start-screen");
    this.gameContainer = document.getElementById("game-container");
    this.playButton = document.getElementById("play-button");
    this.gameArea = document.getElementById("game-area");
    this.dadFace = document.getElementById("dad-face");
    this.momFace = document.getElementById("mom-face");
    this.happyGeorge = document.getElementById("happy-george");
    this.sponge = document.getElementById("sponge");
    this.smashCount = document.getElementById("smash-count");
    this.dadBonks = document.getElementById("dad-bonks");
    this.highScoreDisplay = document.getElementById("high-score-display");
    this.totalBonksDisplay = document.getElementById("total-bonks-display");

    // End game elements
    this.endScreen = document.getElementById("end-screen");
    this.finalSmashCount = document.getElementById("final-smash-count");
    this.finalBonkCount = document.getElementById("final-bonk-count");
    this.finalHighScore = document.getElementById("final-high-score");
    this.finalTotalBonks = document.getElementById("final-total-bonks");
    this.exitButton = document.getElementById("exit-button");
    this.playAgainButton = document.getElementById("play-again-button");
    this.clearStatsButton = document.getElementById("clear-stats-button");

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

    // High score and total bonks system
    this.highScore = this.loadHighScore();
    this.totalBonks = this.loadTotalBonks();

    // Sponge dragging variables
    this.isDraggingSponge = false;
    this.spongeDragStart = { x: 0, y: 0 };
    this.spongeOffset = { x: 0, y: 0 };

    // Food images from the foods folder
    this.foodItems = [
      "images/foods/avocado-removebg-preview.png",
      "images/foods/banana-removebg-preview.png",
      "images/foods/chchcherry-removebg-preview.png",
      "images/foods/crabbypatty-removebg-preview.png",
      "images/foods/pizza-removebg-preview.png",
      "images/foods/tamago-removebg-preview.png",
    ];
    // Smashed version using flubber image
    this.smashedFoodImage = "images/foods/flubber-removebg-preview.png";

    // Sudz image for sponge trail
    this.sudzImage = "images/sudz-removebg-preview.png";

    // Splat and bonk images for effects
    this.splatImage = "images/splat-removebg-preview.png";
    this.bonkImage = "images/bonk-removebg-preview.png";

    // Dad's speech messages
    this.dadMessages = [
      "Stop smashing!",
      "Isla, you're making a mess!",
      "What a disaster!",
      "Look at this mess!",
      "Isla, please stop!",
      "Oh no, what have you done?",
      "This is getting out of hand!",
      "Isla, be careful!",
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
      "Can you wipe this up?",
    ];

    this.init();
  }

  init() {
    this.setupEventListeners();
    // Don't start the game automatically - wait for play button
  }

  startGame() {
    this.gameStarted = true;
    this.gameStartTime = Date.now();
    this.startScreen.classList.add("hidden");
    this.gameContainer.classList.remove("hidden");

    // Update displays with current stats
    this.updateStatDisplays();

    this.startFoodSpawning();
    this.checkDadSpawn();
    this.checkMomSpawn();
  }

  setupEventListeners() {
    // Play button click
    this.playButton.addEventListener("click", () => this.startGame());
    this.playButton.addEventListener("touchstart", () => this.startGame());

    // Game area click/touch for food smashing
    this.gameArea.addEventListener("click", (e) => this.handleGameAreaClick(e));
    this.gameArea.addEventListener("touchstart", (e) =>
      this.handleGameAreaClick(e)
    );

    // Dad face click/touch
    this.dadFace.addEventListener("click", (e) => this.handleDadClick(e));
    this.dadFace.addEventListener("touchstart", (e) => this.handleDadClick(e));

    // Sponge events
    this.sponge.addEventListener("click", (e) => {
      e.stopPropagation();
    });
    this.sponge.addEventListener("mousedown", (e) => this.startSpongeDrag(e));
    this.sponge.addEventListener("touchstart", (e) => this.startSpongeDrag(e));
    document.addEventListener("mousemove", (e) => this.dragSponge(e));
    document.addEventListener("touchmove", (e) => this.dragSponge(e));
    document.addEventListener("mouseup", () => this.stopSpongeDrag());
    document.addEventListener("touchend", () => this.stopSpongeDrag());

    // Exit button
    this.exitButton.addEventListener("click", () => this.endGame());
    this.exitButton.addEventListener("touchstart", () => this.endGame());

    // Play again button
    this.playAgainButton.addEventListener("click", () => this.restartGame());
    this.playAgainButton.addEventListener("touchstart", () =>
      this.restartGame()
    );

    // Clear stats button
    this.clearStatsButton.addEventListener("click", () => this.clearStats());
    this.clearStatsButton.addEventListener("touchstart", () =>
      this.clearStats()
    );

    // Prevent context menu on right click
    this.gameArea.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  startSpongeDrag(e) {
    // Only allow dragging when mom is visible (which means cleanup is needed)
    if (!this.momVisible) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    this.isDraggingSponge = true;

    // Get mouse/touch position first
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    // Move sponge to body for full-screen dragging
    document.body.appendChild(this.sponge);
    this.sponge.style.position = "fixed";
    this.sponge.style.zIndex = "1000";
    this.sponge.style.display = "flex"; // Ensure it's visible

    // Calculate sponge size for proper centering
    const spongeSize = 100; // Match the CSS width/height
    const spongeOffset = spongeSize / 2;

    // Position sponge at mouse/touch location, centered on cursor
    const spongeX = clientX - spongeOffset;
    const spongeY = clientY - spongeOffset;

    // Apply position immediately
    this.sponge.style.left = spongeX + "px";
    this.sponge.style.top = spongeY + "px";
    this.sponge.style.bottom = "";
    this.sponge.style.transform = "none";

    // Set offset for smooth dragging
    this.spongeOffset.x = spongeOffset;
    this.spongeOffset.y = spongeOffset;

    this.sponge.style.cursor = "grabbing";
  }

  dragSponge(e) {
    if (!this.isDraggingSponge) return;

    e.preventDefault();
    e.stopPropagation();

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    // Position sponge at mouse/touch location, centered on cursor
    const newX = clientX - this.spongeOffset.x;
    const newY = clientY - this.spongeOffset.y;

    // Keep sponge within viewport bounds (but allow full screen dragging)
    const spongeSize = 100; // Match the CSS width/height
    const clampedX = Math.max(
      0,
      Math.min(newX, window.innerWidth - spongeSize)
    );
    const clampedY = Math.max(
      0,
      Math.min(newY, window.innerHeight - spongeSize)
    );

    this.sponge.style.left = `${clampedX}px`;
    this.sponge.style.top = `${clampedY}px`;
    this.sponge.style.bottom = "";
    this.sponge.style.transform = "none";

    // Create sudz trail element
    this.createSudzTrail(clientX, clientY);

    // Check for collision with smashed items (only if in game area)
    this.checkSpongeCollision();
  }

  createSudzTrail(x, y) {
    // Create sudz trail element
    const sudzElement = document.createElement("div");
    sudzElement.className = "sudz-trail";
    sudzElement.style.position = "fixed";

    // Responsive sudz size based on screen width
    let sudzSize, offset;
    if (window.innerWidth <= 768) {
      // Mobile
      sudzSize = 40;
      offset = 20;
    } else if (window.innerWidth <= 1024) {
      // Tablet
      sudzSize = 45;
      offset = 22.5;
    } else {
      // Desktop
      sudzSize = 50;
      offset = 25;
    }

    sudzElement.style.left = x - offset + "px"; // Center the sudz
    sudzElement.style.top = y - offset + "px";
    sudzElement.style.width = sudzSize + "px";
    sudzElement.style.height = sudzSize + "px";
    sudzElement.style.zIndex = "999";
    sudzElement.style.pointerEvents = "none";

    // Create sudz image
    const sudzImg = document.createElement("img");
    sudzImg.src = this.sudzImage;
    sudzImg.alt = "Sudz";
    sudzImg.style.width = "100%";
    sudzImg.style.height = "100%";
    sudzImg.style.objectFit = "contain";
    sudzImg.style.opacity = "0.7";

    sudzElement.appendChild(sudzImg);
    document.body.appendChild(sudzElement);

    // Fade out and remove after a longer time
    setTimeout(() => {
      sudzElement.style.transition = "opacity 0.8s ease-out";
      sudzElement.style.opacity = "0";
      setTimeout(() => {
        if (sudzElement.parentNode) {
          sudzElement.parentNode.removeChild(sudzElement);
        }
      }, 800);
    }, 800);
  }

  stopSpongeDrag() {
    if (this.isDraggingSponge) {
      this.isDraggingSponge = false;
      this.sponge.style.cursor = "grab";

      // Return sponge to bottom controls (first position - left side)
      const bottomControls = document.getElementById("bottom-controls");
      bottomControls.insertBefore(this.sponge, bottomControls.firstChild);
      this.sponge.style.position = "relative";
      this.sponge.style.left = "";
      this.sponge.style.top = "";
      this.sponge.style.transform = "";
      this.sponge.style.zIndex = "";
    }
  }

  checkSpongeCollision() {
    const spongeRect = this.sponge.getBoundingClientRect();
    const smashedItems = document.querySelectorAll(".food-item.smashed");

    smashedItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();

      // Check if sponge overlaps with smashed item
      if (this.rectsOverlap(spongeRect, itemRect)) {
        // Remove the smashed item with a fade effect
        item.style.animation = "fadeOut 0.3s ease-out forwards";
        setTimeout(() => {
          if (item.parentNode) {
            item.parentNode.removeChild(item);
          }
        }, 300);
      }
    });
  }

  rectsOverlap(rect1, rect2) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  checkDadSpawn() {
    if (!this.gameStarted) return;

    const gameTime = Date.now() - this.gameStartTime;

    if (gameTime >= 15000 && !this.dadSpawnStarted) {
      // 15 seconds
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
    // Check if we clicked on a food item div or its child image
    const foodItem = target.classList.contains("food-item")
      ? target
      : target.closest(".food-item");

    if (foodItem && !foodItem.classList.contains("smashed")) {
      this.smashFood(foodItem);
    }
  }

  handleDadClick(e) {
    if (this.isCleaning || !this.dadVisible) return;

    e.stopPropagation();
    this.bonkDad();
  }

  createFoodItem() {
    if (this.isCleaning || !this.gameStarted) return;

    const foodItem = document.createElement("div");
    foodItem.className = "food-item";

    // Random food image
    const randomFoodPath =
      this.foodItems[Math.floor(Math.random() * this.foodItems.length)];
    const foodImage = document.createElement("img");
    foodImage.src = randomFoodPath;
    foodImage.alt = "Food";
    foodImage.style.width = "100%";
    foodImage.style.height = "100%";
    foodImage.style.objectFit = "contain";
    foodItem.appendChild(foodImage);

    // Store the image path for later reference
    foodItem.dataset.foodPath = randomFoodPath;

    // Random position
    const x = Math.random() * (this.gameArea.offsetWidth - 120);
    foodItem.style.left = x + "px";
    foodItem.style.bottom = "-120px";

    // Random peak height (between 30% and 80% of screen height)
    const peakHeight = Math.random() * 50 + 30; // 30% to 80% of screen height
    const animationDuration = 2.5 + Math.random() * 1.5; // 2.5-4 seconds

    // Create custom gravity animation
    foodItem.style.animation = "none";
    foodItem.style.transition = `transform ${animationDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

    this.gameArea.appendChild(foodItem);

    // Start the gravity animation after a small delay
    setTimeout(() => {
      if (foodItem.parentNode && !foodItem.classList.contains("smashed")) {
        // Move to peak height
        foodItem.style.transform = `translateY(-${peakHeight}vh)`;

        // After reaching peak, start falling
        setTimeout(() => {
          if (foodItem.parentNode && !foodItem.classList.contains("smashed")) {
            foodItem.style.transition = `transform 2s cubic-bezier(0.55, 0.055, 0.675, 0.19)`;
            foodItem.style.transform = `translateY(100vh)`;
          }
        }, animationDuration * 1000 * 0.6); // Start falling at 60% of the way up
      }
    }, 100);

    // Remove food item after total animation completes
    setTimeout(() => {
      if (foodItem.parentNode && !foodItem.classList.contains("smashed")) {
        foodItem.parentNode.removeChild(foodItem);
      }
    }, (animationDuration + 2) * 1000);
  }

  smashFood(foodElement) {
    // Swap to smashed flubber image
    const originalPath = foodElement.dataset.foodPath;

    // Clear the food item and add smashed flubber image
    foodElement.innerHTML = "";
    const smashedImg = document.createElement("img");
    smashedImg.src = this.smashedFoodImage;
    smashedImg.alt = "Smashed food";
    smashedImg.style.width = "100%";
    smashedImg.style.height = "100%";
    smashedImg.style.objectFit = "contain";
    foodElement.appendChild(smashedImg);

    // Show splat effect
    this.showSplatEffect(foodElement);

    foodElement.classList.add("smashed");
    this.smashCounter++;
    this.smashCount.textContent = this.smashCounter;
    this.playSound("smash");

    // Capture current position on the screen
    const rect = foodElement.getBoundingClientRect();
    const parentRect = this.gameArea.getBoundingClientRect();
    // Calculate position relative to game area
    const left = rect.left - parentRect.left;
    const top = rect.top - parentRect.top;

    // Set absolute position and remove transforms/animations
    foodElement.style.transition = "none";
    foodElement.style.transform = "none";
    foodElement.style.left = `${left}px`;
    foodElement.style.top = `${top}px`;
    foodElement.style.bottom = "auto";
    foodElement.style.position = "absolute";
    foodElement.style.zIndex = 5;
  }

  showSplatEffect(foodElement) {
    // Get the position of the food element
    const rect = foodElement.getBoundingClientRect();
    const gameRect = this.gameArea.getBoundingClientRect();

    // Calculate position relative to game area
    const left = rect.left - gameRect.left;
    const top = rect.top - gameRect.top;

    // Create splat effect element
    const splatElement = document.createElement("div");
    splatElement.className = "splat-effect";
    splatElement.style.position = "absolute";

    // Responsive splat size based on screen width
    let splatSize, splatOffset;
    if (window.innerWidth <= 768) {
      // Mobile
      splatSize = 60;
      splatOffset = 30;
    } else if (window.innerWidth <= 1024) {
      // Tablet
      splatSize = 70;
      splatOffset = 35;
    } else {
      // Desktop
      splatSize = 80;
      splatOffset = 40;
    }

    splatElement.style.left = left - splatOffset + "px"; // Center the splat
    splatElement.style.top = top - splatOffset + "px";
    splatElement.style.width = splatSize + "px";
    splatElement.style.height = splatSize + "px";
    splatElement.style.zIndex = "15";
    splatElement.style.pointerEvents = "none";
    splatElement.style.animation = "splatPop 1s ease-out forwards";

    // Create splat image
    const splatImg = document.createElement("img");
    splatImg.src = this.splatImage;
    splatImg.alt = "Splat";
    splatImg.style.width = "100%";
    splatImg.style.height = "100%";
    splatImg.style.objectFit = "contain";

    splatElement.appendChild(splatImg);
    this.gameArea.appendChild(splatElement);

    // Remove splat effect after 1 second
    setTimeout(() => {
      if (splatElement.parentNode) {
        splatElement.parentNode.removeChild(splatElement);
      }
    }, 1000);
  }

  showBonkEffect() {
    // Get the position of dad's face
    const rect = this.dadFace.getBoundingClientRect();
    const gameRect = this.gameArea.getBoundingClientRect();

    // Calculate position relative to game area
    const left = rect.left - gameRect.left;
    const top = rect.top - gameRect.top;

    // Create bonk effect element
    const bonkElement = document.createElement("div");
    bonkElement.className = "bonk-effect";
    bonkElement.style.position = "absolute";

    // Responsive bonk size based on screen width
    let bonkSize, bonkOffsetX, bonkOffsetY;
    if (window.innerWidth <= 768) {
      // Mobile
      bonkSize = 60;
      bonkOffsetX = 20;
      bonkOffsetY = 30;
    } else if (window.innerWidth <= 1024) {
      // Tablet
      bonkSize = 70;
      bonkOffsetX = 25;
      bonkOffsetY = 35;
    } else {
      // Desktop
      bonkSize = 80;
      bonkOffsetX = 30;
      bonkOffsetY = 40;
    }

    bonkElement.style.left = left + bonkOffsetX + "px"; // Position near dad's head
    bonkElement.style.top = top - bonkOffsetY + "px";
    bonkElement.style.width = bonkSize + "px";
    bonkElement.style.height = bonkSize + "px";
    bonkElement.style.zIndex = "25";
    bonkElement.style.pointerEvents = "none";
    bonkElement.style.animation = "bonkPop 1s ease-out forwards";

    // Create bonk image
    const bonkImg = document.createElement("img");
    bonkImg.src = this.bonkImage;
    bonkImg.alt = "Bonk";
    bonkImg.style.width = "100%";
    bonkImg.style.height = "100%";
    bonkImg.style.objectFit = "contain";

    bonkElement.appendChild(bonkImg);
    this.gameArea.appendChild(bonkElement);

    // Remove bonk effect after 1 second
    setTimeout(() => {
      if (bonkElement.parentNode) {
        bonkElement.parentNode.removeChild(bonkElement);
      }
    }, 1000);
  }

  bonkDad() {
    this.dadBonkCounter++;
    this.dadBonks.textContent = this.dadBonkCounter;

    // Update total bonks
    this.totalBonks++;
    this.totalBonksDisplay.textContent = this.totalBonks;
    this.saveTotalBonks();

    this.dadVisible = false;

    // Play bonk sound effect
    this.playSound("bonk");

    // Hide speech bubble immediately
    const speechBubble = this.dadFace.querySelector(".speech-bubble");
    speechBubble.classList.add("hidden");

    // Show bonk effect
    this.showBonkEffect();

    // Show bonk indicator
    const bonkIndicator = this.dadFace.querySelector(".bonk-indicator");
    bonkIndicator.classList.remove("hidden");

    // Change dad's image to bonked version
    const angryGeorge = document.getElementById("angry-george");
    const bonkedGeorge = document.getElementById("bonked-george");
    angryGeorge.classList.add("hidden");
    bonkedGeorge.classList.remove("hidden");

    // Random rotation (15 degrees left or right)
    const rotation = Math.random() > 0.5 ? 15 : -15;

    // Get current position to ensure proper fall animation
    const currentRect = this.dadFace.getBoundingClientRect();
    const gameRect = this.gameArea.getBoundingClientRect();
    const currentX = currentRect.left - gameRect.left;
    const currentY = currentRect.top - gameRect.top;

    // Set absolute position and animate dad falling
    this.dadFace.style.left = currentX + "px";
    this.dadFace.style.top = currentY + "px";
    this.dadFace.style.transition =
      "transform 2s cubic-bezier(0.55, 0.055, 0.675, 0.19)";
    this.dadFace.style.transform = `translateY(120vh) rotate(${rotation}deg)`;

    // Hide dad after animation
    setTimeout(() => {
      this.dadFace.classList.add("hidden");
      this.dadFace.style.transition = "";
      this.dadFace.style.transform = "";
      // Reset dad's image for next time
      const angryGeorge = document.getElementById("angry-george");
      const bonkedGeorge = document.getElementById("bonked-george");
      angryGeorge.classList.remove("hidden");
      bonkedGeorge.classList.add("hidden");
      // Hide bonk indicator
      const bonkIndicator = this.dadFace.querySelector(".bonk-indicator");
      bonkIndicator.classList.add("hidden");
    }, 2000);
  }

  showDad() {
    if (this.isCleaning || this.dadVisible) return;

    this.dadVisible = true;
    this.dadFace.classList.remove("hidden");

    // Show random speech bubble first to calculate its height
    const speechBubble = this.dadFace.querySelector(".speech-bubble");
    const speechText = this.dadFace.querySelector(".speech-text");
    const randomMessage =
      this.dadMessages[Math.floor(Math.random() * this.dadMessages.length)];

    speechText.textContent = randomMessage;
    const maleVoice = ['Rocko (English (United States))'];

    const foundVoice = speechSynthesis
      .getVoices()
      .find(({ name }) => maleVoice.includes(name));
    console.log("speaking");
    speechSynthesis.cancel();
    let utter = new SpeechSynthesisUtterance(randomMessage);
    if (foundVoice) utter.voice = foundVoice;
    else console.log("no voice found, using default");
    speechSynthesis.speak(utter);

    speechBubble.classList.remove("hidden");

    // Calculate bounds to ensure face and speech bubble are fully visible
    const faceWidth = 120;
    const faceHeight = 120;
    const bubbleHeight = speechBubble.offsetHeight + 20; // Actual bubble height + padding
    const padding = 20; // Extra padding from edges

    // Available area considering speech bubble above
    const maxX = this.gameArea.offsetWidth - faceWidth - padding;
    const maxY =
      this.gameArea.offsetHeight - faceHeight - bubbleHeight - padding;
    const minX = padding;
    const minY = bubbleHeight + padding; // Ensure dad is never too high for speech bubble

    // Random position within safe bounds
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;

    this.dadFace.style.left = x + "px";
    this.dadFace.style.top = y + "px";
    this.dadFace.style.transform = "none"; // Reset transform to allow absolute positioning

    // Dad stays until bonked - no timeout
  }

  showMom() {
    if (this.isCleaning || this.momVisible) return;

    this.momVisible = true;
    this.momLastAppearance = Date.now(); // Track when mom appears
    this.momFace.classList.remove("hidden");

    // Show random speech bubble
    const speechBubble = this.momFace.querySelector(".speech-bubble");
    const speechText = this.momFace.querySelector(".speech-text");
    const randomMessage =
      this.momMessages[Math.floor(Math.random() * this.momMessages.length)];

    speechText.textContent = randomMessage;
    const femaleVoice = ["Google US English"];

    const foundVoice = speechSynthesis
      .getVoices()
      .find(({ name }) => femaleVoice.includes(name));
    console.log("speaking");
    speechSynthesis.cancel();
    let utter = new SpeechSynthesisUtterance(randomMessage);
    if (foundVoice) utter.voice = foundVoice;
    else console.log("no voice found, using default");
    speechSynthesis.speak(utter);
    speechBubble.classList.remove("hidden");

    // Ensure speech bubble stays within viewport bounds - delay to allow rendering
    setTimeout(() => {
      this.adjustSpeechBubblePosition(speechBubble);
    }, 50); // Small delay to ensure bubble is fully rendered

    // Pause food spawning
    this.foodSpawningPaused = true;

    // Enable sponge dragging
    this.sponge.classList.add("draggable");
    this.sponge.style.cursor = "grab";

    // Start checking if cleanup is complete
    this.checkCleanupComplete();
  }

  checkCleanupComplete() {
    if (!this.momVisible) return;

    const smashedItems = document.querySelectorAll(".food-item.smashed");

    if (smashedItems.length === 0) {
      // All smashed items are cleaned, hide mom and resume game

      // Hide mom's speech bubble
      const speechBubble = this.momFace.querySelector(".speech-bubble");
      speechBubble.classList.add("hidden");

      this.momFace.classList.add("hidden");
      this.momVisible = false;
      this.sponge.classList.remove("draggable");
      this.sponge.style.cursor = "pointer";
      this.foodSpawningPaused = false;

      // Show happy George after a short delay
      setTimeout(() => this.showHappyGeorge(), 500);
    } else {
      // Still have smashed items, check again in 1 second
      setTimeout(() => this.checkCleanupComplete(), 1000);
    }
  }

  showHappyGeorge() {
    // Position happy George in the center of the game area
    const gameAreaWidth = this.gameArea.offsetWidth;
    const gameAreaHeight = this.gameArea.offsetHeight;
    const happyGeorgeWidth = 120;
    const happyGeorgeHeight = 120;

    const x = (gameAreaWidth - happyGeorgeWidth) / 2;
    const y = (gameAreaHeight - happyGeorgeHeight) / 2;

    this.happyGeorge.style.left = x + "px";
    this.happyGeorge.style.top = y + "px";
    this.happyGeorge.classList.remove("hidden");

    const maleVoice = ['Rocko (English (United States))'];

    const foundVoice = speechSynthesis
      .getVoices()
      .find(({ name }) => maleVoice.includes(name));
    console.log("speaking");
    speechSynthesis.cancel();
    let utter = new SpeechSynthesisUtterance("Much better Isla!");
    if (foundVoice) utter.voice = foundVoice;
    else console.log("no voice found, using default");
    speechSynthesis.speak(utter);

    // Hide happy George after 3 seconds
    setTimeout(() => {
      this.happyGeorge.classList.add("hidden");
    }, 3000);
  }

  adjustSpeechBubblePosition(speechBubble) {
    // Get the speech bubble's current position and size
    const bubbleRect = speechBubble.getBoundingClientRect();
    const momRect = this.momFace.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Check if mom is partially off screen - use a larger safety margin
    if (momRect.right > viewportWidth - 40) {
      // Mom is off screen, adjust her position
      const overflow = momRect.right - (viewportWidth - 40);
      const currentMargin = parseInt(this.momFace.style.marginRight || 0);
      // Only adjust if we haven't already adjusted for this overflow
      if (currentMargin < overflow) {
        this.momFace.style.marginRight = overflow + "px";
      }
    }

    // Check if the speech bubble extends beyond the left edge of the viewport
    if (bubbleRect.left < 40) {
      // Calculate how much it's extending beyond the viewport
      const overflow = 40 - bubbleRect.left;

      // Adjust the left position to keep it within bounds
      const currentLeft = parseInt(speechBubble.style.left || 0);
      // Only adjust if we haven't already adjusted for this overflow
      if (currentLeft < overflow) {
        speechBubble.style.left = overflow + "px";
      }
    }
  }

  startFoodSpawning() {
    // Spawn food every 1-3 seconds
    const spawnFood = () => {
      if (!this.isCleaning && this.gameStarted && !this.foodSpawningPaused) {
        this.createFoodItem();
      } else {
        console.log("Food spawning blocked:", {
          isCleaning: this.isCleaning,
          gameStarted: this.gameStarted,
          foodSpawningPaused: this.foodSpawningPaused,
        });
      }
      const nextSpawn = Math.random() * 2000 + 1000; // 1-3 seconds
      setTimeout(spawnFood, nextSpawn);
    };
    spawnFood();
  }

  startDadSpawning() {
    let lastDadSpawn = Date.now();
    const maxTimeWithoutDad = 45000; // 45 seconds maximum

    // Show dad every 8-15 seconds with fallback timer
    const spawnDad = () => {
      const currentTime = Date.now();
      const timeSinceLastSpawn = currentTime - lastDadSpawn;

      // Force dad to appear if it's been too long
      if (timeSinceLastSpawn >= maxTimeWithoutDad) {
        if (!this.isCleaning && !this.dadVisible) {
          this.showDad();
          lastDadSpawn = currentTime;
        }
      } else if (!this.isCleaning && !this.dadVisible) {
        // Normal random spawn
        this.showDad();
        lastDadSpawn = currentTime;
      }

      // Schedule next spawn with random timing
      const nextSpawn = Math.random() * 7000 + 8000; // 8-15 seconds
      setTimeout(spawnDad, nextSpawn);
    };

    // Start the spawning cycle
    spawnDad();

    // Fallback timer to ensure dad appears within 45 seconds
    const fallbackTimer = () => {
      const currentTime = Date.now();
      const timeSinceLastSpawn = currentTime - lastDadSpawn;

      if (
        timeSinceLastSpawn >= maxTimeWithoutDad &&
        !this.isCleaning &&
        !this.dadVisible
      ) {
        this.showDad();
        lastDadSpawn = currentTime;
      }

      // Check again in 5 seconds
      setTimeout(fallbackTimer, 5000);
    };

    // Start the fallback timer
    setTimeout(fallbackTimer, 5000);
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
    this.gameStarted = false;

    // Check for new high score
    const isNewHighScore = this.checkHighScore();

    // Update final scores
    this.finalSmashCount.textContent = this.smashCounter;
    this.finalBonkCount.textContent = this.dadBonkCounter;
    this.finalHighScore.textContent = this.highScore;
    this.finalTotalBonks.textContent = this.totalBonks;

    // Hide game container and show end screen
    this.gameContainer.classList.add("hidden");
    this.endScreen.classList.remove("hidden");

    // Start fireworks
    this.startFireworks();

    // Show high score celebration if it's a new record
    if (isNewHighScore) {
      this.showHighScoreCelebration();
    }
  }

  restartGame() {
    // Reset counters
    this.smashCounter = 0;
    this.dadBonkCounter = 0;
    this.smashCount.textContent = "0";
    this.dadBonks.textContent = "0";

    // Reset game state
    this.isCleaning = false;
    this.dadVisible = false;
    this.momVisible = false;
    this.dadSpawnStarted = false;
    this.momSpawnStarted = false;
    this.foodSpawningPaused = false;

    // Hide end screen and show start screen
    this.endScreen.classList.add("hidden");
    this.startScreen.classList.remove("hidden");

    // Clear any remaining game elements
    const foodItems = document.querySelectorAll(".food-item");
    foodItems.forEach((item) => item.remove());

    // Reset sponge
    this.sponge.classList.remove("draggable");
    this.sponge.style.cursor = "pointer";

    // Hide dad and mom
    this.dadFace.classList.add("hidden");
    this.momFace.classList.add("hidden");
  }

  startFireworks() {
    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#ff8800",
      "#8800ff",
    ];

    const createFirework = () => {
      const firework = document.createElement("div");
      firework.className = "firework";
      const color = colors[Math.floor(Math.random() * colors.length)];
      firework.style.backgroundColor = color;
      firework.style.left = Math.random() * window.innerWidth + "px";

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
      const particle = document.createElement("div");
      particle.className = "firework-particle";
      particle.style.backgroundColor = color;
      particle.style.left = centerX + "px";
      particle.style.top = centerY + "px";

      // Random direction for each particle
      const angle = (Math.PI * 2 * i) / 20; // Evenly distributed in a circle
      const distance = 50 + Math.random() * 100; // Random distance
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      particle.style.setProperty("--dx", dx + "px");
      particle.style.setProperty("--dy", dy + "px");

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
    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#ff8800",
      "#8800ff",
      "#ffffff",
    ];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Create a massive burst with particles going across the whole screen
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div");
      particle.className = "firework-particle";
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = centerX + "px";
      particle.style.top = centerY + "px";
      particle.style.width = "4px";
      particle.style.height = "4px";
      particle.style.boxShadow = "0 0 8px currentColor";

      // Random direction for each particle to cover the whole screen
      const angle = (Math.PI * 2 * i) / 50; // Evenly distributed in a circle
      const distance = 200 + Math.random() * 300; // Much larger distance for screen coverage
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      particle.style.setProperty("--dx", dx + "px");
      particle.style.setProperty("--dy", dy + "px");

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
          this.createMiniBurst(
            centerX + (Math.random() - 0.5) * 200,
            centerY + (Math.random() - 0.5) * 200
          );
        }, burst * 300);
      }
    }, 500);
  }

  createMiniBurst(x, y) {
    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#ff8800",
      "#8800ff",
    ];

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("div");
      particle.className = "firework-particle";
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = x + "px";
      particle.style.top = y + "px";

      const angle = (Math.PI * 2 * i) / 15;
      const distance = 80 + Math.random() * 120;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      particle.style.setProperty("--dx", dx + "px");
      particle.style.setProperty("--dy", dy + "px");

      this.endScreen.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1500);
    }
  }

  // High score methods
  loadHighScore() {
    const saved = localStorage.getItem("islaSmashHighScore");
    return saved ? parseInt(saved) : 0;
  }

  saveHighScore(score) {
    localStorage.setItem("islaSmashHighScore", score.toString());
    this.highScore = score;
  }

  checkHighScore() {
    if (this.smashCounter > this.highScore) {
      this.saveHighScore(this.smashCounter);
      return true;
    }
    return false;
  }

  // Total bonks methods
  loadTotalBonks() {
    const saved = localStorage.getItem("islaSmashTotalBonks");
    return saved ? parseInt(saved) : 0;
  }

  saveTotalBonks() {
    localStorage.setItem("islaSmashTotalBonks", this.totalBonks.toString());
  }

  // Update all stat displays
  updateStatDisplays() {
    this.highScoreDisplay.textContent = this.highScore;
    this.totalBonksDisplay.textContent = this.totalBonks;
  }

  // Clear all stats
  clearStats() {
    this.showClearStatsConfirmation();
  }

  showClearStatsConfirmation() {
    // Create custom confirmation popup
    const popup = document.createElement("div");
    popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            animation: fadeIn 0.3s ease-out;
        `;

    const dialog = document.createElement("div");
    dialog.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            margin: 20px;
            animation: popupSlide 0.3s ease-out;
        `;

    dialog.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #333; font-family: 'Comic Sans MS', cursive, sans-serif;">Clear All Stats?</h3>
            <p style="margin: 0 0 25px 0; color: #666; font-family: 'Comic Sans MS', cursive, sans-serif; line-height: 1.4;">
                This will reset your high score and total dad bonks to 0. This action cannot be undone.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="confirm-yes" style="
                    padding: 10px 20px;
                    background: #ff4444;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-family: 'Comic Sans MS', cursive, sans-serif;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">Yes, Clear Stats</button>
                <button id="confirm-no" style="
                    padding: 10px 20px;
                    background: #666;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-family: 'Comic Sans MS', cursive, sans-serif;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">No, Keep Stats</button>
            </div>
        `;

    popup.appendChild(dialog);
    document.body.appendChild(popup);

    // Add hover effects
    const yesBtn = dialog.querySelector("#confirm-yes");
    const noBtn = dialog.querySelector("#confirm-no");

    yesBtn.addEventListener("mouseenter", () => {
      yesBtn.style.background = "#ff6666";
      yesBtn.style.transform = "scale(1.05)";
    });
    yesBtn.addEventListener("mouseleave", () => {
      yesBtn.style.background = "#ff4444";
      yesBtn.style.transform = "scale(1)";
    });

    noBtn.addEventListener("mouseenter", () => {
      noBtn.style.background = "#888";
      noBtn.style.transform = "scale(1.05)";
    });
    noBtn.addEventListener("mouseleave", () => {
      noBtn.style.background = "#666";
      noBtn.style.transform = "scale(1)";
    });

    // Handle button clicks
    yesBtn.addEventListener("click", () => {
      this.executeClearStats();
      document.body.removeChild(popup);
    });

    noBtn.addEventListener("click", () => {
      document.body.removeChild(popup);
    });

    // Close on background click
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        document.body.removeChild(popup);
      }
    });
  }

  executeClearStats() {
    // Clear localStorage
    localStorage.removeItem("islaSmashHighScore");
    localStorage.removeItem("islaSmashTotalBonks");

    // Reset variables
    this.highScore = 0;
    this.totalBonks = 0;

    // Update displays
    this.updateStatDisplays();
    this.finalHighScore.textContent = "0";
    this.finalTotalBonks.textContent = "0";

    // Show confirmation message
    this.showClearStatsMessage();
  }

  showClearStatsMessage() {
    // Create a confirmation message
    const message = document.createElement("div");
    message.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 0, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 1.2em;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            animation: clearStatsPop 0.5s ease-out;
        `;
    message.textContent = "Stats Cleared! ✅";

    this.endScreen.appendChild(message);

    // Remove the message after 2 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 2000);
  }

  showHighScoreCelebration() {
    // Create a special high score message
    const highScoreMessage = document.createElement("div");
    highScoreMessage.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #333;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 1.5em;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            animation: highScorePop 0.5s ease-out;
        `;
    highScoreMessage.innerHTML = `
            🎉 NEW HIGH SCORE! 🎉<br>
            Isla smashed ${this.smashCounter} items!<br>
            <span style="font-size: 0.8em;">Previous best: ${this.highScore}</span>
        `;

    this.endScreen.appendChild(highScoreMessage);

    // Remove the message after 4 seconds
    setTimeout(() => {
      if (highScoreMessage.parentNode) {
        highScoreMessage.parentNode.removeChild(highScoreMessage);
      }
    }, 4000);
  }
}

// Add fadeOut animation to CSS
const style = document.createElement("style");
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
    
    @keyframes highScorePop {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes clearStatsPop {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes fadeIn {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
    
    @keyframes popupSlide {
        0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
        }
        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new IslaSmashGame();
});
