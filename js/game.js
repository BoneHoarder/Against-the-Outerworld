let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 320,
    physics: {
        default: 'arcade'
    },
    scene: {
        init: init,
        preload: preload,
        create: create,
        update: update
    },
    audio: {
        disableWebAudio: true
    }
};

var game = new Phaser.Game(config);

let playerShipImage;

let winScreen;
let playButtonImage;

let ennemyImage, groundEnnemyImage;
let ennemiesGroup;
let ENNEMYNB, BULLETNB,MISSILENB;
let swpawnEnemiesTimer;

let boss, bossHitbox,bossUpper,bossLower;
let bossHP;
let BOSSBULLETNB;
let bossBulletTimer1;
let bossBulletTimer2;

let cursors;

let missiles;
let spacebar;

let ennemyTween;
let explosionAnimation;

let isPlaying;

let boom;

function init() {
    ENNEMYNB= 6;
    BULLETNB=15;
    BOSSBULLETNB= 5000;
    MISSILENB=50;
    bossHP= 5;
    isPlaying= true;
}

function preload() {

    this.load.image('player', './assets/images/ship.png');
    this.load.image('bullet', './assets/images/bullets.png');

    this.load.image('ennemy', './assets/images/fly2.0.png');
    this.load.image('groundEnnemy', './assets/images/groundennemy.png');
    this.load.image('ennemyBullet', './assets/images/star2.png');

    this.load.image('boss', './assets/images/boss.gif');
    this.load.image('boss hitbox', './assets/images/boss_hitbox.gif');
    this.load.image('boss upper', './assets/images/boss_upper.gif');
    this.load.image('boss lower', './assets/images/boss_lower.gif');

    //load spritesheet animation
    this.load.spritesheet('exploAnim', './assets/animations/explosion.png',{ frameWidth: 128, frameHeight: 128 });

    this.load.audio('boom', './assets/audio/explosion.wav');

    this.load.image('tiles', './assets/images/tiles.png');
    this.load.tilemapTiledJSON('backgroundMap','./assets/tiled/r_typeV1.json');

    this.load.image('WinScreen', './assets/images/space.png');
    this.load.image('playButton', './assets/images/playButton.webp');
    
}

function create() {

    //test mode
    //this.cameras.main.scrollX=2350;
    // ENNEMYNB= 0;
    // BULLETNB=0;
    // MISSILENB=250;

    //background tiled
    let map = this.make.tilemap({ key: 'backgroundMap' });
    let sciti = map.addTilesetImage('Sci-Fi', 'tiles', 16, 16, 0, 0);
    let layer = map.createStaticLayer(0, sciti, 0, 0);

    layer.setCollisionBetween(1, 3200);


    //player
    playerShipImage = this.physics.add.image(100, 160, 'player');
    playerShipImage.setVelocity(100,0);

    //commands
    cursors = this.input.keyboard.createCursorKeys();

    // bullets group
    missiles = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: MISSILENB
    });

    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    groundEnnemyImage= this.physics.add.image(400, 320-64, 'groundEnnemy');

    boss= this.physics.add.image(3200-115, 100, 'boss').setImmovable(true);
    bossHitbox= this.physics.add.image(3200-115, 100, 'boss hitbox').setImmovable(true);
    bossUpper= this.physics.add.image(3200-115, 50, 'boss upper').setImmovable(true);
    bossLower= this.physics.add.image(3200-115, 150, 'boss lower').setImmovable(true);

    // bullets group
    ennemyBullets = this.physics.add.group({
        defaultKey: 'ennemyBullet',
        maxSize: BULLETNB
    });

    //timer to spawn ennemy's bullets
    this.time.addEvent({
        delay: 1000, // ms
        callback: shootEnnemyBullets,
        repeat: BULLETNB-1
    })

    // boss bullets group
    bossBullets = this.physics.add.group({
        defaultKey: 'ennemyBullet',
        maxSize: BOSSBULLETNB
    });

    ennemiesGroup = this.physics.add.group({
        defaultKey: 'ennemy',
        maxSize: ENNEMYNB
    });

    //timer to spawn ennemies
    spawnEnemiesTimer= this.time.addEvent({
        delay: 5000, // ms
        callback: spawnEnnemy,
        callbackScope: this,
        repeat: ENNEMYNB
    })

    //detect collisions between layer and player
    this.physics.add.collider(playerShipImage, layer, collisionPlayerLayer, null, this);

    //detect collisions between missiles and layer
    this.physics.add.collider(missiles, layer, collisionMissileLayer, null, this);

    //detect collisions between bullets and ennemies
    this.physics.add.collider(ennemiesGroup, missiles, collisionEnnemyBullet, null, this);

    //detect collisions between missiles and boss hitbox
    this.physics.add.collider(bossHitbox, missiles, collisionMissileBossHitbox, null, this);

    //detect collisions between missiles and boss upper
    this.physics.add.collider(bossUpper, missiles, collisionMissileBossUpper, null, this);

    //detect collisions between missiles and boss lower
    this.physics.add.collider(bossLower, missiles, collisionMissileBossLower, null, this);

    //detect collisions between player and boss 
    this.physics.add.collider(playerShipImage, boss, collisionPlayerBoss, null, this);

    //detect collision between player and ennemies
    this.physics.add.collider(playerShipImage, ennemiesGroup, collisionEnnemyPlayer, null, this);

    //detect colision between player and enemy bullets
    this.physics.add.collider(playerShipImage, ennemyBullets, collisionBulletPlayer, null, this);

    //detect colision between player and boss bullets
    this.physics.add.collider(playerShipImage, bossBullets, collisionBossBulletPlayer, null, this);


    //animation for explosion
    explosionAnimation = this.anims.create({
        key: 'explode',
        frames: this.anims.generateFrameNumbers('exploAnim'),
        frameRate: 20,
        repeat: 0,
        hideOnComplete: true
        });

    boom= this.sound.add('boom');

    ennemyTween = this.tweens.add({
        targets: ennemiesGroup,
        y: 100,
        angle: 180,
        duration: 200,
        ease: 'linear',
        yoyo: false,
        loop: 1000,
    });

    winScreen= this.add.image(3200-850, 30, 'WinScreen');
    winScreen.setOrigin(0,0);
    winScreen.setVisible(false);

    playButtonImage= this.add.image(3200-450,250, 'playButton').setInteractive();
    playButtonImage.setScale(0.07);
    playButtonImage.on('pointerdown', restartGame);
    playButtonImage.setVisible(false);

}

function update() {

    if(isPlaying){

        //scrolling
        if (this.cameras.main.scrollX<2400) this.cameras.main.scrollX += 1;

        //start boss fire
        if(this.cameras.main.scrollX==2000) {
            bossBulletTimer1= this.time.addEvent({
                delay: 500, // ms
                callback: shootBossBullets,
                repeat: BOSSBULLETNB-1
            })

            bossBulletTimer2= this.time.addEvent({
                delay: 500, // ms
                callback: shootBossBullets2,
                repeat: BOSSBULLETNB-1
            })
        }

        //movement with cursors
        if (cursors.right.isDown) playerShipImage.setVelocity(80,0);

        if (cursors.left.isDown) playerShipImage.setVelocity(-80,0);

        if (cursors.down.isDown) playerShipImage.setVelocityY(80);

        if (cursors.up.isDown) playerShipImage.setVelocityY(-80);

        //if player press the space bar
        if (Phaser.Input.Keyboard.JustDown(spacebar)){
            let missile = missiles.get();
            if (missile) {
                missile.setPosition(playerShipImage.x+22, playerShipImage.y+7);
                missile.setVelocity(200,0);
            }
        }

        if (bossHP==0 && isPlaying){

            bossBulletTimer1.paused= true;
            bossBulletTimer2.paused= true;
            boss.destroy();
            bossUpper.destroy();
            bossLower.destroy();
            bossHitbox.destroy();

            spawnEnemiesTimer.paused= true;

            // let enemy= ennemiesGroup.get();
            // enemy.destroy();

            // let ennemyBullet= ennemyBullets.get();
            // ennemyBullet.destroy();

            this.cameras.main.scrollX=2350;

            winScreen.setVisible(true);
            playButtonImage.setVisible(true);

        }

        //out of bounds in x
        if (playerShipImage.x<this.cameras.main.scrollX+17) playerShipImage.x=this.cameras.main.scrollX+17;
        if (playerShipImage.x>this.cameras.main.scrollX+800-17) playerShipImage.x=this.cameras.main.scrollX+800-17;
    }
    else
    {
        //location.reload();
        this.scene.start();
    }

}


function spawnEnnemy(){

    let ennemy= ennemiesGroup.get();
    if (ennemy) {
        ennemy.setPosition(this.cameras.main.scrollX+ 850, Phaser.Math.Between(50,270));
        ennemy.setVelocity(-100,0);
    }
}

function shootEnnemyBullets(){
    let evilBullet = ennemyBullets.get();
        if (evilBullet) {
            evilBullet.setPosition(groundEnnemyImage.x, groundEnnemyImage.y-9);
            longeurDuVecteur = Math.sqrt((playerShipImage.x-groundEnnemyImage.x)**2 + (playerShipImage.y-groundEnnemyImage.y)**2);
            evilBullet.setVelocity(((playerShipImage.x-groundEnnemyImage.x)/longeurDuVecteur)*100, ((playerShipImage.y-groundEnnemyImage.y)/longeurDuVecteur)*100);
        }
}

function shootBossBullets(){
    let bossBullet = bossBullets.get();
        if (bossBullet) {
            bossBullet.setPosition(boss.x-110, boss.y-25);
            longeurDuVecteur = Math.sqrt((playerShipImage.x-boss.x)**2 + (playerShipImage.y-boss.y)**2);
            bossBullet.setVelocity(((playerShipImage.x-boss.x)/longeurDuVecteur)*100, ((playerShipImage.y-boss.y)/longeurDuVecteur)*100);
        }
}


function shootBossBullets2(){
    let bossBullet = bossBullets.get();
        if (bossBullet) {
            bossBullet.setPosition(boss.x-60, boss.y+55);
            longeurDuVecteur = Math.sqrt((playerShipImage.x-boss.x)**2 + (playerShipImage.y-boss.y)**2);
            bossBullet.setVelocity(((playerShipImage.x-boss.x)/longeurDuVecteur)*100, ((playerShipImage.y-boss.y)/longeurDuVecteur)*100);
        }
}

function collisionEnnemyBullet(missile, ennemy){

    let explosionAnim = this.add.sprite(ennemy.x, ennemy.y,'explosionAnim');
    explosionAnim.play('explode');

    missile.destroy();
    ennemy.destroy();
    boom.play();
}

function collisionEnnemyPlayer(player, ennemy){

    let explosionAnim = this.add.sprite(player.x, player.y,'explosionAnim');
    explosionAnim.play('explode');

    ennemy.destroy();
    player.destroy();
    isPlaying= false;
}

function collisionMissileBossUpper(bossUpper, missile){

    let explosionAnim = this.add.sprite(missile.x, missile.y,'explosionAnim');
    explosionAnim.play('explode');

    missile.destroy();

}

function collisionMissileBossLower(bossLower, missile){

    let explosionAnim = this.add.sprite(missile.x, missile.y,'explosionAnim');
    explosionAnim.play('explode');

    missile.destroy();

}


function collisionPlayerBoss(player, boss){

    let explosionAnim = this.add.sprite(player.x, player.y,'explosionAnim');
    explosionAnim.play('explode');

    player.destroy();
    bossBulletTimer1.paused= true;
    bossBulletTimer2.paused= true;

    isPlaying= false;

}

function collisionMissileBossHitbox(bossHitbox, missile){

    let explosionAnim = this.add.sprite(missile.x, missile.y,'explosionAnim');
    explosionAnim.play('explode');
    bossHP-=1;
    missile.destroy();
}

function collisionPlayerLayer(player, layer){

    let explosionAnim = this.add.sprite(player.x, player.y,'explosionAnim');
    explosionAnim.play('explode');

    player.destroy();

    isPlaying= false;
}

function collisionMissileLayer(missile, layer){

    let explosionAnim = this.add.sprite(missile.x, missile.y,'explosionAnim');
    explosionAnim.play('explode');

    missile.destroy();
}

function collisionBulletPlayer(ennemyBullet, player){

    let explosionAnim = this.add.sprite(player.x, player.y,'explosionAnim');
    explosionAnim.play('explode');

    ennemyBullet.destroy();
    player.destroy();
    isPlaying= false;
}

function collisionBossBulletPlayer(bossBullet, player){

    let explosionAnim = this.add.sprite(player.x, player.y,'explosionAnim');
    explosionAnim.play('explode');

    bossBullet.destroy();
    player.destroy();
    bossBulletTimer1.paused= true;
    bossBulletTimer2.paused= true;
    isPlaying= false;
}

function restartGame()
{
    isPlaying= false;
}
