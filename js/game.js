 class SpriteImage extends Image {

    /**
     * Constructs a new Image object that defines the source path on 
     * construction.
     * 
     * @param {*} path The image source path
     */
    constructor(path) {
        super();
        super.src = path;
    }

}

/**
 * jQuery object referencing the joke paragraph container.
 */
const $jokeParagraph = $('#joke');

/**
 * The HTML canvas held as a jQuery object reference.
 */
const $gameCanvas = $('canvas#game-canvas');

/**
 * Stores the @$gameCanvas object referenced as a painting/drawing context for 2d.
 */
const $gameContext = $gameCanvas.get(0).getContext('2d');

/**
 * Image object containing game sprite images.
 */
 const sprite = new SpriteImage('./images/sprites/sprite.png');

 /**
  * Default angle degree for tilting sprites.
  */
 const degree = (Math.PI / 180);

 // Game ready state.
 const READY = 0;

 // Game playing state.
 const PLAYING = 1;

 // Game over state.
 const OVER = 2;

/**
 * Holds the JSON object containing sprite coordinate information.
 */
let spriteInfo;

/**
 * The current game frames.
 */
let gameFrames = 0;

/**
 * The current joke.
 */
let joke = '';

/**
 * Handles toggling dark mode styling on the webpage.
 */
const toggleDarkMode = (event) => {
    $('.toggle-dark-mode').toggleClass('on-status');
    $('body').toggleClass('dark-mode');
    $('header').toggleClass('dark-mode');
    $('i').toggleClass('fa-regular fa-moon dark-mode fa-solid fa-moon')
}

/**
 * Builds all the sprite information for the environment and game by
 * retrieving the related data from the loaded JSON file.
 */
const buildSpriteReferences = () => {
    game.ready.gr = spriteInfo.gameReady;
    game.over.go = spriteInfo.gameOver;
    environment.background.data = spriteInfo.gameBackground;
    environment.foreground.data = spriteInfo.gameForeground;
}

/**
 * Holds animation frame related information. and animation updating logic.
 * 
 * @update updates frame variables and rending position.
 * 
 * @animate renders the image by drawing it to the canvas.
 */
const chuck = {

    frames: [
        {state: 'chuckIdle', x: 0, y: 0, width: 0, height: 0}, //1st frame
        {state: 'chuckIgnition', x: 0, y: 0, width: 0, height: 0}, //2nd frame
        {state: 'chuckBlasting', x: 0, y: 0, width: 0, height: 0}, //3rd frame
        {state: 'chuckIgnition', x: 0, y: 0, width: 0, height: 0}  //4th frame
    ],
    frame: 0,
    speedMultiplier: 0,
    physicsGravity: 0.25,
    jumpRate: 5,
    rotation: 0,
    canvasX: 50,
    canvasY: 150,

    // Draws the animation based on the current frame.
    animate: function () {
        var chuck = game.inState(OVER) ? spriteInfo.deathPoop : this.frames[this.frame];

        $gameContext.save();
        $gameContext.translate(this.canvasX , this.canvasY );
        $gameContext.rotate(game.inState(OVER) ? 0 : this.rotation);
        $gameContext.drawImage(sprite, chuck.x, chuck.y, chuck.width, chuck.height, -chuck.width/2, game.inState(OVER) ? (-chuck.height / 2) +15 : -chuck.height / 2, chuck.width, chuck.height);
        $gameContext.restore();
    },

    // Calculates the boost jump to render.
    boost: function () {
        this.speedMultiplier =- this.jumpRate;
    },

    // Tesets the chuck animation variables to defaults.
    reset: function() {
        this.frame = 0;
        this.speedMultiplier = 0;
        this.canvasY = 150;
    },

    // Checks if chuks sprite position has collided with bounds for death.
    isDead: function(chuck) {
        var collisionHeight = ($gameCanvas.height() - environment.foreground.data.height);
        var foregroundOffset = 49; // This is the increased collision y axis on the foreground.
        var chuckLocation = this.canvasY + (chuck.height / 2);

        return (chuckLocation >= (collisionHeight + foregroundOffset));
    },

    // Updates animation frames based on cycles.
    update: function () {
        var chuck = this.frames[this.frame];

        this.period = game.inState(READY) ? 10 : 5;

        this.frame += gameFrames % this.period == 0 ? 1 : 0;

        if (this.frame >= this.frames.length)
            this.frame = 0;
    
        if (!game.inState(READY)) {

            this.speedMultiplier += this.physicsGravity;
            this.canvasY += this.speedMultiplier;

            if (this.isDead(chuck)) {

                this.canvasY = $gameCanvas.height() - environment.foreground.data.height - (chuck.height / 2) + 65;
                if (game.inState(PLAYING)) {
                    getJoke();
                    game.state = OVER;
                }
            }

            this.rotation = (this.speedMultiplier >= this.jumpRate) ? 180 * degree : 25 * degree;

        } else {
            this.canvasY = 150;
            this.rotation = 0;
        }
    }
};

/**
 * Holds game event and status information and rendering methods for game state interfaces.
 */
const game = {

    state: 0,
    ready: {
        canvasX: $gameCanvas.width()/2 - 174/2,
        canvasY: 120,
        gr: undefined,

        create: function() {

            // Only draws the ready image if the current game state is 'ready'
            if (game.inState(READY)) {
                $gameContext.drawImage(sprite, this.gr.x, this.gr.y, this.gr.width, this.gr.height, this.canvasX, this.canvasY, this.gr.width, this.gr.height)
            }
        }
    },
    over: {
        canvasX: $gameCanvas.width()/2 - 226/2,
        canvasY: 120,
        go: undefined,

        create: function() {

            // Only draws the over image if the current game state is 'over'
            if (game.inState(OVER)) {
                $gameContext.drawImage(sprite, this.go.x, this.go.y, this.go.width, this.go.height, this.canvasX, this.canvasY, this.go.width, this.go.height)
            }
        
        }
    },

    // Checks if the current game state matches a given state.
    inState: function(state) {
        return this.state == state;
    }
};

/**
 * Holds game environmental detail information.
 */
const environment = {

    background: {
        canvasX: 0,
        canvasY: $gameCanvas.height() - 270,
        data: undefined,
        deltaX: 0.5,

        // Draws the background image to the canvas.
        create: function() {

            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, this.canvasX, this.canvasY, this.data.width, this.data.height);
            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, this.canvasX + this.data.width, this.canvasY, this.data.width, this.data.height);
            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, this.canvasX + (this.data.width * 2), this.canvasY, this.data.width, this.data.height);
        }
    },
    foreground: {
        canvasX: 0,
        canvasY: $gameCanvas.height() - 112,
        deltaX: 2,
        data: undefined,

        // Draws the foreground image to the canvas.
        create: function() {

            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, this.canvasX, this.canvasY, this.data.width, this.data.height);
            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, this.canvasX + this.data.width, this.canvasY, this.data.width, this.data.height);
            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, this.canvasX + (this.data.width * 2), this.canvasY, this.data.width, this.data.height);
        }
    },
    update: function(type) {

        if (game.inState(PLAYING)) {

            type.canvasX = ((type.canvasX - type.deltaX) % (type.data.width));
        }
    }
};

/**
 * Registered to the click event listener for the game canvas. Will execute game logic
 * based on the current game state.
 * 
 * @param {*} event 
 */
const gameClickListener = () => {

    switch (game.state) {

        case READY:
            game.state = PLAYING;
            break;

        case PLAYING:
            //chuck.animate();
            chuck.boost();
            break;

        case OVER: 
        $jokeParagraph.text('Play for a Chuck Norris joke!');
            chuck.reset();
            game.state = READY
            break;

        //Just a fall back
        default:
            break;

    }

}

/**
 * Binds to the canvas keydown. This will fire the gameClickListener()
 * if a valid key was pressed.
 * 
 * @param {*} event pressed key
 */
const keyPressedListener = event => {

    if (event.keyCode === 32) {
        gameClickListener();
    }

};

/**
 * Loads  and assigns the locally stored JSON object containing sprite coordinate information.
 */
const loadJSON = () => {
    $.ajax({
        url: './js/sprite-info.json',
        dataType: 'json',
        async: false,
        success: data => {
            spriteInfo = data;
            
            // Populates the animation frame data.
            chuck.frames.forEach(element => {
                element.x = spriteInfo[element.state].x;
                element.y = spriteInfo[element.state].y;
                element.width = spriteInfo[element.state].width;
                element.height = spriteInfo[element.state].height;
            });
        }
    })
};

/**
 * Grabs a random joke from the chuck API and displays it in a paragraph.
 */
const getJoke = () => {

    $.ajax({url: 'https://api.chucknorris.io/jokes/random'}).then(
        (data) => {
            $jokeParagraph.text(data.value);
        },
        (err) => {

        }
    )

};

/**
 * Handles updating graphical elements on the canvas by 'painting' them
 * for display.
 */
const paint = () => {

    $gameContext.fillStyle = '#faaf3d';
    $gameContext.fillRect(0, 0, $gameCanvas.width(), $gameCanvas.height());

    environment.background.create();
    environment.foreground.create();
    game.ready.create();
    game.over.create();
    chuck.animate();

};

/**
 * Executes game cycle updating logic.
 */
const tick = () => {

    // Updates the chuck animation frames.
    chuck.update();

    // Updates the foreground position.
    environment.update(environment.foreground);
    environment.update(environment.background)

    // Paints the game details on the canvas.
    paint();

    // Increment the game frames each tick.
    gameFrames++;

    // Perform animation request.
    requestAnimationFrame(tick);

};

/**
 * Builds the game once the sprite has been loaded.
 */
sprite.onload = () => {

    // Load the JSON sprite data.
    loadJSON();

    // Assigns JSON sprite references.
    buildSpriteReferences();

    // Builds the event listener
    $gameCanvas.on('click', gameClickListener);

    // Builds the key press listener for using spacebar.
    $(document).keypress(keyPressedListener);

    // Listens for clicks on the dark mode toggle.
    $('.toggle-dark-mode').click(toggleDarkMode);

    // Begin game logic ticking.
     tick();
}