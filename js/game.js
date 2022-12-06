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

class GameAudio extends Audio {

    /**
     * Constructs a new Audio object that defines the source path on construction.
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
 const sprite = new SpriteImage('./images/sprites/sprite_custom.png');

 /**
 * Holds the GameAudio objects containing sound file information.
 */
const GAME_SOUNDS = {};

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
let spriteInfo = undefined;

/**
 * The current game frames.
 */
let gameFrames = 0;

/**
 * The current joke.
 */
let joke = '';

/**
 * Toggles sounds on and off.
 */
let soundsOn = true;

/**
 * This will be set
 */
let jetpackSoundOn = true;

/**
 * Plays a sound only if sounds are toggled on.
 */
function playSound(sound) {
    if (!soundsOn) return;

    sound.currentTime = sound.currentTime > 0 ? 0 : 0;

    return sound.play();
}

/**
 * Plays a sound after another sound with a delay.
 * 
 * @param {*} firstSound 
 * @param {*} secondSound 
 */
const playSoundAfterDelayed = (firstSound, secondSound, seconds) => {
    if (!soundsOn) return;

    setTimeout(function () {
        playSound(secondSound);
    }, seconds * 1000);
}

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
    environment.spikes.data = spriteInfo.spikes;
    environment.obstacle.above.data = spriteInfo.gameCactiUp;
    environment.obstacle.below.data = spriteInfo.gameCactiDown;
    game.medal.bronze = spriteInfo.bronzeChuckCoin;
    game.medal.silver = spriteInfo.silverChuckCoin;
    game.medal.gold = spriteInfo.goldChuckCoin;
    game.medal.platinum = spriteInfo.platinumChuckCoin;
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
    collisionRadius: 10,
    jumpRate: 4.5,
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
        playSound(GAME_SOUNDS.JET_PACK);
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

            if ((this.canvasY + (chuck.height / 2)) < 20 && !game.inState(OVER)) {
                game.state = OVER;
                playSoundAfterDelayed(playSound(GAME_SOUNDS.IMPACT), GAME_SOUNDS.GAME_OVER, 1);           
            }

            if (this.isDead(chuck)) {

                this.canvasY = $gameCanvas.height() - environment.foreground.data.height - (chuck.height / 2) + 65;
                if (game.inState(PLAYING)) {
                    getJoke();
                    game.state = OVER;
                    playSoundAfterDelayed(playSound(GAME_SOUNDS.IMPACT), GAME_SOUNDS.GAME_OVER, 0.2);           
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
    start: {
        canvasX: 195,
        canvasY: 310,
        width: 85,
        height: 25,

        clickedOn: function(x, y) {
        
            if (x >= this.canvasX &&
                x <= this.canvasX + this.width &&
                y >= this.canvasY && 
                y <= this.canvasY + this.height) {
                    return true;
            }
            return false;
        }
    },
    medal: {

        bronze: undefined,
        silver: undefined,
        gold: undefined,
        platinum: undefined,

        create: function() {

            if (game.inState(OVER)) {
                const rank = this.getMedal();

                if (rank == 0) return;

                $gameContext.drawImage(sprite, rank.x, rank.y, rank.width, rank.height, 133, 208, rank.width, rank.height);          
            }
        },

        getMedal: function() {
            const silverRank = 25;
            const goldRank = 100;
            const platinumRank = 200;
            
            if (game.score.points < silverRank)
                return this.bronze;
            if (game.score.points < goldRank)
                return this.silver;
            if (game.score.points < platinumRank)
                return this.gold;

            return platinum;
        }
    },
    score: {
        personalBest: (localStorage.getItem('jpc-pb-score') || 0),
        points: 0,

        create: function() {
            $gameContext.fillStyle = '#FFF';
            $gameContext.strokeStyle = '#111';

            switch (game.state) {

                case PLAYING:
                    $gameContext.lineWidth = 2;
                    $gameContext.font = '45px Teko';
                    $gameContext.fillText(this.points, $gameCanvas.width() / 2, 50);
                    $gameContext.strokeText(this.points, $gameCanvas.width() / 2, 50);
                    break;

                case OVER:
                    $gameContext.font = '25px Teko';
                    $gameContext.fillText(this.points, 285, 215);
                    $gameContext.strokeText(this.points, 285, 215);
                    $gameContext.fillText(this.personalBest, 285, 257);
                    $gameContext.strokeText(this.personalBest, 285, 257);
                    break;

                default:
                    
                    break;

            }
        }
    },

    reset: function() {
        $jokeParagraph.text('Play for a Chuck Norris joke!');
        chuck.reset();
        environment.obstacle.reset();
        game.state = READY
        game.score.points = 0;
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
        deltaX: 1,

        // Draws the background image to the canvas.
        create: function() {
            // This prevents a white line from happening when the canvasX is a decimal.
            const canvasXR = Math.round(this.canvasX);

            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, canvasXR, this.canvasY, this.data.width, this.data.height);
            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, canvasXR + this.data.width, this.canvasY, this.data.width, this.data.height);
            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, canvasXR + (this.data.width * 2), this.canvasY, this.data.width, this.data.height);
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
    spikes: {
        canvasX: 0,
        canvasY: 0,
        data: undefined,

        create: function() {
            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, this.canvasX, this.canvasY, this.data.width, this.data.height);
            $gameContext.drawImage(sprite, this.data.x, this.data.y, this.data.width, this.data.height, this.canvasX + this.data.width, this.canvasY, this.data.width, this.data.height);
        }
    },
    obstacle: {

        safeZoneHeight: 100,
        maxCanvasY: -150,
        deltaX: 2,
        position: [],

        above: {
            data: undefined
        },
        below: {
            data: undefined,
        },

        create: function() {
            
            this.position.forEach(element => {
                var aboveY = element.y;
                var belowY = element.y + 400 + this.safeZoneHeight;

                $gameContext.drawImage(sprite, this.above.data.x, this.above.data.y, this.above.data.width, this.above.data.height, element.x, aboveY, this.above.data.width, this.above.data.height);
                $gameContext.drawImage(sprite, this.below.data.x, this.below.data.y, this.below.data.width, this.below.data.height, element.x - 60, belowY, this.below.data.width, this.below.data.height);    
            })
        },

        update: function() {
 
            if (!game.inState(PLAYING)) return;

            if ((gameFrames % 115) == 0) {
                this.position.push({
                    x: $gameCanvas.width(),
                    y: (this.maxCanvasY * (Math.random() + 1))
                });
            }

            this.position.forEach(element => {
                element.x -= this.deltaX;

                var bottomObstacleY = (element.y + 400 + this.safeZoneHeight);

                // TODO!! Make this bottome collision detections code better.

                // Top obstacle collision mapping.
                if ((chuck.canvasX + chuck.collisionRadius > element.x && 
                    chuck.canvasX - chuck.collisionRadius < element.x + this.above.data.width &&
                    chuck.canvasY + chuck.collisionRadius > element.y && 
                    chuck.canvasY - chuck.collisionRadius < element.y + this.above.data.height) || 
                    // Bottom mapping
                    (chuck.canvasX + chuck.collisionRadius > element.x && 
                    chuck.canvasX - chuck.collisionRadius < element.x + this.above.data.width &&
                    chuck.canvasY + chuck.collisionRadius > bottomObstacleY && 
                    chuck.canvasY - chuck.collisionRadius < bottomObstacleY + this.above.data.height)) {
                        game.state = OVER;
                        playSoundAfterDelayed(playSound(GAME_SOUNDS.IMPACT), GAME_SOUNDS.GAME_OVER, .7);
                        getJoke();
                }

                if (element.x + this.above.data.width <= 90 && element.x + this.above.data.width >= 89) {
                    game.score.points += 1;
                    playSound(GAME_SOUNDS.SCORE);
                    game.score.personalBest = Math.max(game.score.points, game.score.personalBest);
                    localStorage.setItem('jpc-pb-score', 5);
                }
                // Prevent rendering of obstacles after it's passed the visible canvas.
                if (element.x + 252 <= 0) this.position.shift();
            });

        },

        // Clears existing obstacles...
        reset: function () {
            this.position = [];
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
const gameClickListener = (event) => {

    switch (game.state) {

        case READY:
            game.state = PLAYING;
            break;

        case PLAYING:
            //chuck.animate();
            chuck.boost();
            break;

        case OVER:
            if (event.keyCode === 32) {
                game.reset();
                break;
            }
            var rectangle = $gameCanvas.get(0).getBoundingClientRect();
            var x = event.clientX - rectangle.left;
            var y = event.clientY - rectangle.top;
            console.log(x, y)

            if (game.start.clickedOn(x, y)) {
                game.reset();
            }
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
        gameClickListener(event);
    }
};

/**
 * Loads  and assigns the locally stored JSON object containing sprite coordinate information.
 */
const loadJSON = () => {
    $.ajax({
        url: './js/game-data.json',
        dataType: 'json',
        async: false,
        success: data => {
            let gameSounds = data.sounds;
            spriteInfo = data.sprites;

            for (sound in gameSounds) {
                
                GAME_SOUNDS[sound] = new GameAudio(gameSounds[sound].file);
                GAME_SOUNDS[sound].playbackRate = gameSounds[sound].playbackSpeed;
                GAME_SOUNDS[sound].volume = gameSounds[sound].volume;
            }
            
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

    environment.spikes.create();
    environment.background.create();
    environment.obstacle.create();
    environment.foreground.create();
    game.ready.create();
    game.over.create();
    game.medal.create();
    chuck.animate();
    game.score.create();
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

    // Updates the obstacle positions.
    environment.obstacle.update();

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