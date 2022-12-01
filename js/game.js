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
 const sprite = new SpriteImage('./sprites/sprite.png');

/**
 * Holds the JSON object containing sprite coordinate information.
 */
let spriteInfo;

/**
 * The current game frames.
 */
let gameFrames = 0;

const buildSpriteReferences = () => {
    game.ready.gr = spriteInfo.gameReady;
    game.over.go = spriteInfo.gameOver;
    environment.background.bg = spriteInfo.gameBackground;
    environment.foreground.fg = spriteInfo.gameForeground;
}

/**
 * Holds animation frame related information.
 */
const chuckAnimation = {

    frames: [
        {state: 'chuckIdle', x: 0, y: 0, width: 0, height: 0}, //1st frame
        {state: 'chuckIgnition', x: 0, y: 0, width: 0, height: 0}, //2nd frame
        {state: 'chuckBlasting', x: 0, y: 0, width: 0, height: 0}, //3rd frame
        {state: 'chuckIgnition', x: 0, y: 0, width: 0, height: 0}  //4th frame
    ],
    frame: 2,
    canvasX: 50,
    canvasY: 150,

    // Draws the animation based on the current frame.
    create: function () {
        var chuck = this.frames[this.frame];

        $gameContext.drawImage(sprite, chuck.x, chuck.y, chuck.width, chuck.height, this.canvasX, this.canvasY, chuck.width, chuck.height);
    }

};

/**
 * Holds game event and status information.
 */
const game = {

    state: {
        current: 0,
        ready: 0,
        playing: 1,
        over: 2
    },
    ready: {
        canvasX: $gameCanvas.width()/2 - 174/2,
        canvasY: 120,
        gr: undefined,

        create: function() {

            // Only draws the ready image if the current game state is 'ready'
            if (game.state.current == game.state.ready) {
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
            if (game.state.current == game.state.over) {
                $gameContext.drawImage(sprite, this.go.x, this.go.y, this.go.width, this.go.height, this.canvasX, this.canvasY, this.go.width, this.go.height)
            }
        }
    }
};

/**
 * Holds game environmental detail information.
 */
const environment = {

    background: {
        canvasX: 0,
        canvasY: $gameCanvas.height() - 204,
        bg: undefined,

        // Draws the background image to the canvas.
        create: function() {

            $gameContext.drawImage(sprite, this.bg.x, this.bg.y, this.bg.width, this.bg.height, this.canvasX, this.canvasY, this.bg.width, this.bg.height);
            $gameContext.drawImage(sprite, this.bg.x, this.bg.y, this.bg.width, this.bg.height, this.canvasX + this.bg.width, this.canvasY, this.bg.width, this.bg.height);

        }
    },
    foreground: {
        canvasX: 0,
        canvasY: $gameCanvas.height() - 112,
        fg: undefined,

        // Draws the foreground image to the canvas.
        create: function() {

            $gameContext.drawImage(sprite, this.fg.x, this.fg.y, this.fg.width, this.fg.height, this.canvasX, this.canvasY, this.fg.width, this.fg.height);
            $gameContext.drawImage(sprite, this.fg.x, this.fg.y, this.fg.width, this.fg.height, this.canvasX + this.fg.width, this.canvasY, this.fg.width, this.fg.height);

        }
    }
};

/**
 * Registered to the click event listener for the game canvas. Will execute game logic
 * based on the current game state.
 * 
 * @param {*} event 
 */
const gameClickListener = event => {
    
    switch (game.state.current) {

        case game.state.ready:
            game.state.current = game.state.playing;
            break;

        case game.state.playing:
            break;

        case game.state.over: 
            game.state.current = game.state.ready;
            break;

        //Just a fall back
        default:
            break;

    }

}

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
            chuckAnimation.frames.forEach(element => {
                element.x = spriteInfo[element.state].x;
                element.y = spriteInfo[element.state].y;
                element.width = spriteInfo[element.state].width;
                element.height = spriteInfo[element.state].height;
            });
        }
    })
};

/**
 * Handles updating graphical elements on the canvas by 'painting' them
 * for display.
 */
const paint = () => {

    $gameContext.fillStyle = '#70c5ce';
    $gameContext.fillRect(0, 0, $gameCanvas.width(), $gameCanvas.height());

    environment.background.create();
    environment.foreground.create();
    game.ready.create()
    game.over.create();
    chuckAnimation.create();

};

/**
 * Executes game cycle updating logic.
 */
const tick = () => {

    paint();

    //Perform animation request.
    //requestAnimationFrame(tick);

};

sprite.onload = () => {

    // Load the JSON sprite data.
    loadJSON();

    // Assigns JSON sprite references.
    buildSpriteReferences();

    // Builds the event listener
    $gameCanvas.on('click', gameClickListener);

    // Begin game logic ticking.
     tick();
}






