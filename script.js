// Step 1: Set up the game canvas and make it responsive
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Function to set canvas size
function setCanvasSize() {
  const desktopWidth = 480;
  const desktopHeight = 640;
  const aspectRatio = desktopWidth / desktopHeight;
  const maxWidth = window.innerWidth * 0.95; // 95% of window width
  const maxHeight = window.innerHeight * 0.95; // 95% of window height

  if (
    window.innerWidth >= desktopWidth &&
    window.innerHeight >= desktopHeight
  ) {
    // Use fixed size for desktop
    canvas.width = desktopWidth;
    canvas.height = desktopHeight;
  } else if (maxWidth / aspectRatio <= maxHeight) {
    // Fit to width
    canvas.width = maxWidth;
    canvas.height = maxWidth / aspectRatio;
  } else {
    // Fit to height
    canvas.height = maxHeight;
    canvas.width = maxHeight * aspectRatio;
  }
}

// Set initial canvas size
setCanvasSize();

// Update canvas size when window is resized
window.addEventListener('resize', setCanvasSize);

// Fill the canvas background (sky color)
context.fillStyle = '#70c5ce';
context.fillRect(0, 0, canvas.width, canvas.height);

// Step 8: Adding Background and Graphics
const backgroundImage = new Image(); // Create a new image object
backgroundImage.src = './bg.png'; // Path to your background image

const birdImage = new Image(); // Create a new image for the bird
birdImage.src = './bird.png'; // Path to your bird image

// const pipeTopImage = new Image(); // Create a new image for the top pipe
// pipeTopImage.src = 'path/to/pipe-top-image.png'; // Path to your top pipe image

// const pipeBottomImage = new Image(); // Create a new image for the bottom pipe
// pipeBottomImage.src = 'path/to/pipe-bottom-image.png'; // Path to your bottom pipe image

// Step 7: Adding Sound Effects
let flapSound, gameOverSound, dingSound; // Declare sound variables

// Function to initialize sounds
function initializeSounds() {
  flapSound = new Audio('./wing-flap.mp3'); // Sound for flapping
  gameOverSound = new Audio('./game-over.mp3'); // Sound for game over
  dingSound = new Audio('./ding.mp3'); // Sound for passing a pipe
}

// Step 2: Create the main character (the bird)
// Define the bird's properties
const bird = {
  x: 50, // Bird's X position (from the left side)
  y: canvas.height / 2, // Bird's Y position (centered vertically)
  radius: 20, // The size of the bird (a circle for now)
  color: '#ff0', // The bird's color (yellow)
  gravity: 0.6, // The gravity force (pulls the bird down)
  lift: -10, // The force of the bird flapping upward
  velocity: 0, // The current velocity (speed) of the bird
};

// Draw the background image
function drawBackground() {
  context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// // Function to draw the bird
// function drawBird() {
//   context.beginPath();
//   context.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
//   context.fillStyle = bird.color;
//   context.fill();
//   context.closePath();
// }

// Update the draw functions to use images instead of shapes
function drawBird() {
  context.drawImage(
    birdImage,
    bird.x - bird.radius,
    bird.y - bird.radius,
    bird.radius * 2,
    bird.radius * 2
  );
}

// Step 4: Create the obstacles (pipes)
// Define pipe properties
const pipes = [];
const pipeWidth = 50;
const pipeGap = 150; // The gap between the top and bottom pipes
const pipeSpeed = 2; // Speed at which pipes move from right to left

// Function to generate new pipes
function generatePipe() {
  const pipeHeight =
    Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
  pipes.push({
    x: canvas.width, // New pipe starts off-screen on the right
    y: pipeHeight, // Random height for the top pipe
  });
}

// Function to draw pipes
function drawPipes() {
  pipes.forEach((pipe) => {
    // Draw the top pipe
    context.fillStyle = '#228B22'; // Green color for pipes
    context.fillRect(pipe.x, 0, pipeWidth, pipe.y);

    // Draw the bottom pipe
    context.fillRect(
      pipe.x,
      pipe.y + pipeGap,
      pipeWidth,
      canvas.height - (pipe.y + pipeGap)
    );
  });
}

// Function to update pipe positions (moving left)
function updatePipes() {
  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed; // Move pipes to the left

    // Remove pipes that are off the screen
    if (pipe.x + pipeWidth < 0) {
      pipes.shift(); // Remove the first pipe from the array
    }
  });

  // Generate new pipes at regular intervals
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
    generatePipe();
  }
}

// Step 3: Apply gravity and flapping mechanics

// Function to update the bird's position
function updateBird() {
  // Apply gravity to the bird's velocity
  bird.velocity += bird.gravity;

  // Update the bird's position based on its velocity
  bird.y += bird.velocity;

  // Prevent the bird from going off the top of the screen
  if (bird.y < 0) {
    bird.y = 0;
    bird.velocity = 0; // Stop the upward movement at the top
  }

  // Prevent the bird from falling off the bottom of the screen
  if (bird.y + bird.radius > canvas.height) {
    bird.y = canvas.height - bird.radius;
    bird.velocity = 0; // Stop the bird when it hits the ground
  }
}

// Function to handle flapping (jumping)
function flap() {
  bird.velocity = bird.lift; // Give the bird an upward velocity
  //   bird.velocity = -bird.flapStrength; // Make the bird jump
  flapSound.currentTime = 0; // Reset the sound to play from the beginning
  flapSound.play(); // Play flap sound
}

// Update the collision detection to handle game over
function checkCollisions() {
  pipes.forEach((pipe) => {
    if (
      bird.x + bird.radius > pipe.x && // Bird hits pipe on the right side
      bird.x - bird.radius < pipe.x + pipeWidth && // Bird hits pipe on the left side
      (bird.y - bird.radius < pipe.y || // Bird hits top pipe
        bird.y + bird.radius > pipe.y + pipeGap) // Bird hits bottom pipe
    ) {
      isGameOver = true; // Set game over status
      gameOverSound.play(); // Play game over sound
    }
  });

  // Check if the bird hits the ground
  if (bird.y + bird.radius >= canvas.height) {
    isGameOver = true; // Set game over status
    gameOverSound.play(); // Play game over sound
  }
}

// Step 6: Implement Game Over Condition
let isGameOver = false; // Flag to track game status

// Step 5: Score Tracking
let score = 0; // Initialize the score

// Function to reset the game
function resetGame() {
  bird.y = canvas.height / 2; // Reset bird position
  bird.velocity = 0; // Reset bird velocity
  pipes.length = 0; // Clear pipes
  score = 0; // Reset score
  isGameOver = false; // Reset game over status
}

// Function to update the score
function updateScore() {
  pipes.forEach((pipe) => {
    if (pipe.x + pipeWidth === bird.x - bird.radius) {
      score++; // Increment score when the bird passes a pipe
      dingSound.currentTime = 0; // Reset the sound to play from the beginning
      dingSound.play(); // Play ding sound when passing a pipe
    }
  });
}

// Function to draw the score on the canvas
function drawScore() {
  context.fillStyle = '#fff'; // White color for the score
  context.font = '20px Arial'; // Font size and style
  context.fillText('Score: ' + score, 10, 30); // Display score on canvas
}

// Function to draw the Game Over message
function drawGameOver() {
  context.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background
  context.fillRect(0, 0, canvas.width, canvas.height); // Cover the canvas

  context.fillStyle = '#fff'; // White color for text
  context.font = '40px Arial'; // Font size and style
  context.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2 - 20); // Center the text
  context.font = '20px Arial'; // Smaller font for score
  context.fillText(
    'Score: ' + score,
    canvas.width / 2 - 50,
    canvas.height / 2 + 20
  ); // Show final score
}

// Update the game loop to include game over checks and drawing
function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the background
  drawBackground();

  // Update and draw the bird
  updateBird();
  drawBird();

  // Update and draw the pipes
  updatePipes();
  drawPipes();

  // Update the score
  updateScore();

  // Draw the score
  drawScore();

  // Check for collisions
  checkCollisions();

  // Draw game over screen if the game is over
  if (isGameOver) {
    drawGameOver();
    return; // Stop the game loop
  }

  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

// Control the game with spacebar, mouse click, or touch
function handleInput(event) {
  if (!flapSound && !gameOverSound) {
    initializeSounds(); // Initialize sounds on first input
  }

  // Prevent default behavior for touch events to avoid scrolling
  if (event.type === 'touchstart') {
    event.preventDefault();
  }

  if (
    (event.type === 'keydown' && event.code === 'Space') ||
    event.type === 'click' ||
    event.type === 'touchstart'
  ) {
    if (isGameOver) {
      resetGame();
      gameLoop(); // Restart the game loop
    } else {
      flap(); // Call the flap function
    }
  }
}

// Add event listeners for both keydown and click events
document.addEventListener('keydown', handleInput);
document.addEventListener('click', handleInput);
