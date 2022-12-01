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
 * The frame state names. Also references the key for values within the spriteInfo object.
 */
const animationFrameStates = ['chuckIdle', 'chuckIgnition', 'chuckBlasting', 'chuckIdle'];

/**
 * Holds animation frame related information.
 */
const chuckAnimation = {

    frame: [
        {x: 0, y: 0, width: 0, height: 0}, //1st frame
        {x: 0, y: 0, width: 0, height: 0}, //2nd frame
        {x: 0, y: 0, width: 0, height: 0}, //3rd frame
        {x: 0, y: 0, width: 0, height: 0}  //4th frame
    ],
    canvasX: 50,
    canvasY: 150

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
            animationFrameStates.forEach((state, index) => {
                chuckAnimation.frame[index].x = spriteInfo[state].x;
                chuckAnimation.frame[index].y = spriteInfo[state].y;
                chuckAnimation.frame[index].width = spriteInfo[state].width;
                chuckAnimation.frame[index].height = spriteInfo[state].height;
            });
        }
    })
    console.log(chuckAnimation.frame[2])
};

/**
 * Handles updating graphical elements on the canvas by 'painting' them
 * for display.
 */
const paint = () => {

    $gameContext.fillStyle = '#70c5ce';
    $gameContext.fillRect(0, 0, $gameCanvas.width(), $gameCanvas.height());
};

/**
 * Executes game cycle updating logic.
 */
const tick = () => {

    paint();

    //Perform animation request.
    requestAnimationFrame(tick);

};

sprite.onload = () => {
    loadJSON();
    var idleChuck = spriteInfo.gameCactiDown;
    $gameContext.drawImage(sprite, idleChuck.x, idleChuck.y, idleChuck.width, idleChuck.height, 110, 0, idleChuck.width, idleChuck.height)

}






