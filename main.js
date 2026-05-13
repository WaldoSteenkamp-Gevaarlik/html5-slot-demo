const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1a1a1a',

    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

// SYMBOL NAMES
let symbols = [
    "cherry",
    "lemon",
    "star",
    "seven",
    "diamond",
    "grapes"
];

// REELS
let reelTexts = [];

// PLAYER DATA
let credits = 100;
let betAmount = 10;

// UI
let creditsText;
let resultText;
let isSpinning = false;

function preload() {

    // LOAD SYMBOL IMAGES
    this.load.image('cherry', 'assets/symbols/cherry.png');
    this.load.image('lemon', 'assets/symbols/lemon.png');
    this.load.image('star', 'assets/symbols/star.png');
    this.load.image('seven', 'assets/symbols/seven.png');
    this.load.image('diamond', 'assets/symbols/diamond.png');
    this.load.image('grapes', 'assets/symbols/grapes.png');
}

function create() {

    // TITLE
    this.add.text(190, 50, 'MY SLOT MACHINE', {
        fontSize: '40px',
        color: '#ffffff'
    });

    // CREDITS
    creditsText = this.add.text(20, 20, 'Credits: 100', {
        fontSize: '32px',
        color: '#ffff00'
    });

    // RESULT TEXT
    resultText = this.add.text(260, 150, '', {
        fontSize: '40px',
        color: '#00ff00'
    });

    // REEL BACKGROUNDS
    for (let i = 0; i < 3; i++) {

        this.add.rectangle(
            250 + (i * 120),
            290,
            100,
            140,
            0x333333
        )
        .setStrokeStyle(4, 0xffffff);
    }

    // CREATE REELS
    for (let i = 0; i < 3; i++) {

        let randomSymbol = Phaser.Utils.Array.GetRandom(symbols);

        let reel = this.add.image(
            250 + (i * 120),
            290,
            randomSymbol
        );

        reel.setDisplaySize(90, 90);

        reelTexts.push(reel);
    }

    // SPIN BUTTON
    const spinButton = this.add.text(330, 500, 'SPIN', {
        fontSize: '32px',
        backgroundColor: '#ff0000',
        padding: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10
        }
    });

    spinButton.setInteractive();

    spinButton.on('pointerdown', () => {

        spinReels();

    });
}

function spinReels() {

    // STOP DOUBLE SPINS
    if (isSpinning) {
        return;
    }

    isSpinning = true;

    // REMOVE BET
    credits -= betAmount;

    creditsText.setText("Credits: " + credits);

    resultText.setText("");

    let finalSymbols = [];

    for (let i = 0; i < reelTexts.length; i++) {

        let reel = reelTexts[i];

        // SPIN ANIMATION TIMER
        let spinInterval = setInterval(() => {

            let randomSymbol = Phaser.Utils.Array.GetRandom(symbols);

            reel.setTexture(randomSymbol);

            // FAKE MOVEMENT EFFECT
            reel.y += 10;

            if (reel.y > 310) {
                reel.y = 270;
            }

        }, 80);

        // STOP REEL
        setTimeout(() => {

            clearInterval(spinInterval);

            let finalSymbol = Phaser.Utils.Array.GetRandom(symbols);

            reel.setTexture(finalSymbol);

            reel.y = 290;

            finalSymbols[i] = finalSymbol;

            // LAST REEL FINISHED
            if (i === reelTexts.length - 1) {

                checkWin(finalSymbols);

                isSpinning = false;
            }

        }, 1500 + (i * 700));
    }
}

function checkWin(finalSymbols) {

    // 3 MATCHING SYMBOLS
    if (
        finalSymbols[0] === finalSymbols[1] &&
        finalSymbols[1] === finalSymbols[2]
    ) {

        let winAmount = betAmount * 5;

        credits += winAmount;

        creditsText.setText("Credits: " + credits);

        resultText.setText("YOU WIN!");
    }
    else {

        resultText.setText("TRY AGAIN");
    }
}