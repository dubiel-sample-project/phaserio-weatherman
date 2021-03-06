/// <reference path="phaser.d.ts" />

export module Weatherman {
    export class Game {
        game: Phaser.Game;

        constructor() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {});
            this.game.state.add('Intro', Weatherman.Intro, true);
            this.game.state.add('CloudGame', Weatherman.CloudGame, false);
            this.game.state.add('SunGame', Weatherman.SunGame, false);
        }
    }

    export class Intro {
        game: Phaser.Game;
        flashCoolDown: number;
        startTime: number;
        alertTextAdded: boolean;
        mainTextAdded: boolean;
        helpTextAdded: boolean;

        preload() {
            this.game.load.image('stormyweather', 'assets/stormyweather.png');
            this.game.load.image('hotweather', 'assets/hotweather.png');
        }

        create() {
            this.flashCoolDown = this.game.time.now;
            this.startTime = this.game.time.now;
            this.alertTextAdded = false;
            this.mainTextAdded = false;
            this.helpTextAdded = false;
            this.game.camera.flash(0xff0000, 700);
        }

        update() {
            if(this.game.time.now > this.flashCoolDown + 1500) {
                this.flashCoolDown = this.game.time.now;
                this.game.camera.flash(0xff0000, 700);
            }

            if(!this.alertTextAdded) {
                this.alertTextAdded = true;
                var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
                let text = this.game.add.text(0, 0, "Weather Alert! Weather Alert!", style);
                text.setTextBounds(0, 100, 800, 100);
            }

            if(!this.mainTextAdded && this.game.time.now > this.startTime + 2200) {
                this.mainTextAdded = true;
                var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
                let text = this.game.add.text(0, 0, "Save the city from the bad weather, Weatherman!", style);
                text.setTextBounds(0, 150, 800, 100);

                let stormyWeatherImage = this.game.add.sprite(175, 300, 'stormyweather');
                stormyWeatherImage.inputEnabled = true;
                stormyWeatherImage.events.onInputDown.add(function(){
                    this.game.state.start('CloudGame');
                }, this);

                let heatwaveWeatherImage = this.game.add.sprite(425, 300, 'hotweather');
                heatwaveWeatherImage.inputEnabled = true;
                heatwaveWeatherImage.events.onInputDown.add(function(){
                    this.game.state.start('SunGame');
                }, this);
            }

            if(!this.helpTextAdded && this.game.time.now > this.startTime + 6000) {
                this.helpTextAdded = true;
                var style = { font: "bold 16px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
                let text = this.game.add.text(0, 0, "uh, click one of the pictures below to play", style);
                text.setTextBounds(0, 200, 800, 100);
            }
        }
    }

    interface Fireable {
        fire(game: Phaser.Game);
    }

    interface Updateable {
        update(game: Phaser.Game);
    }

    interface HasSprite {
        getSprite(): Phaser.Sprite;
    }

    class Explodable {
        explosions: Phaser.Group;

        createExplosion(game: Phaser.Game) {
            this.explosions = game.add.group();

            var explosionAnimation = this.explosions.create(0, 0, 'explosion', 0, false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.animations.add('explosion');
        }

        playExplosion(x: number, y: number) {
            var explosionAnimation = this.explosions.getFirstExists(false);
            if(explosionAnimation) {
                explosionAnimation.reset(x, y);
                explosionAnimation.play('explosion', 30, false, true);
            }
        }
    }

    abstract class MainGame {
        static rgb2hex(red, green, blue) {
            return blue | (green << 8) | (red << 16);
        }

        game: Phaser.Game;
        platforms: Phaser.Group;
        cursors: Phaser.CursorKeys;
        player: Player;
        scene: Scene;

        protected abstract createScene(player: Player, game: Phaser.Game): Scene;

        create() {
            applyMixins(Character, [Explodable]);
            applyMixins(Building, [Explodable]);

            this.game.physics.startSystem(Phaser.Physics.ARCADE);

            this.game.add.sprite(0, 0, 'sky');

            this.platforms = this.game.add.group();
            this.platforms.enableBody = true;

            let ground = this.platforms.create(0, this.game.world.height - 64, 'ground');
            ground.scale.setTo(2, 2);
            ground.body.immovable = true;

            this.player = new Player(
                this.game.add.sprite(32, this.game.world.height - 150, 'weatherman'),
                this.game
            );

            this.scene = this.createScene(this.player, this.game);
            this.player.getSprite().bringToTop();
            this.cursors = this.game.input.keyboard.createCursorKeys();
        }

        update() {
            this.game.physics.arcade.collide(this.player.getSprite(), this.platforms);

            this.player.update(this.game);
            this.scene.update(this.game);

            this.player.move(0, 'left');

            if (this.cursors.left.isDown) {
                this.player.move(-150, 'left');
            }
            else if (this.cursors.right.isDown) {
                this.player.move(150, 'right');
            }
            else {
                this.player.stop();
            }

            if (this.cursors.up.isDown) {
                this.player.moveUp(-350);
            }

            if (this.game.input.activePointer.isDown) {
                this.player.fire(this.game);
            }
        }
    }

    export class CloudGame extends MainGame {
        preload() {
            this.game.load.image('sky', 'assets/sky.png');
            this.game.load.image('ground', 'assets/platform.png');
            this.game.load.spritesheet('weatherman', 'assets/dude.png', 32, 48);
            this.game.load.image('bullet', 'assets/bullet.png');
            this.game.load.image('raindrop', 'assets/raindrop.png');
            this.game.load.image('stormcloud', 'assets/stormcloud3.png');
            this.game.load.image('lightning', 'assets/lightning.png');
            this.game.load.spritesheet('explosion', 'assets/explosion.png', 64, 64, 23);
            this.game.load.atlas('building1', 'assets/building1.png', 'assets/building1.json');
            this.game.load.atlas('building2', 'assets/building2.png', 'assets/building2.json');
            this.game.load.atlas('building4', 'assets/building4.png', 'assets/building4.json');
            this.game.load.atlas('building5', 'assets/building5.png', 'assets/building5.json');
            this.game.load.atlas('building7', 'assets/building7.png', 'assets/building7.json');
        }

        protected createScene(player: Player, game: Phaser.Game) {
            return new CloudScene(player, game);
        }
    }

    export class SunGame extends MainGame {
        preload() {
            this.game.load.image('sky', 'assets/sky.png');
            this.game.load.image('ground', 'assets/platform.png');
            this.game.load.spritesheet('weatherman', 'assets/dude.png', 32, 48);
            this.game.load.image('bullet', 'assets/bullet.png');
            this.game.load.image('sun', 'assets/sun7.png');
            this.game.load.image('sunray', 'assets/sunray3.png');
            this.game.load.image('heatwave', 'assets/heatwave2.png');
            this.game.load.spritesheet('explosion', 'assets/explosion.png', 64, 64, 23);
            this.game.load.atlas('building1', 'assets/building1.png', 'assets/building1.json');
            this.game.load.atlas('building2', 'assets/building2.png', 'assets/building2.json');
            this.game.load.atlas('building4', 'assets/building4.png', 'assets/building4.json');
            this.game.load.atlas('building5', 'assets/building5.png', 'assets/building5.json');
            this.game.load.atlas('building7', 'assets/building7.png', 'assets/building7.json');
        }

        protected createScene(player: Player, game: Phaser.Game) {
            return new SunScene(player, game);
        }
    }

    abstract class Character implements Fireable, Updateable, Explodable, HasSprite {
        name: string;
        hp: number;
        originalHp: number;
        sprite: Phaser.Sprite
        firstBullets: Phaser.Group;
        secondBullets: Phaser.Group;
        firstFireCoolDown: number;
        secondFireCoolDown: number;
        firstFireCoolDownPause: number;
        secondFireCoolDownPause: number;
        firstBulletsMaxDamage: number;
        secondBulletsMaxDamage: number;
        target: Character;
        firstBulletsSpeed: number;
        secondBulletsSpeed: number;
        player: Player;
        buildings: any;
        explosions: Phaser.Group;

        abstract update(game: Phaser.Game);
        abstract bulletHit(object: any, bullet : any);
        protected abstract setCoolDownPauses(game: Phaser.Game);

        createExplosion: (game: Phaser.Game) => void;
        playExplosion: (x: number, y: number) => void;

        constructor(name: string, hp: number, sprite: Phaser.Sprite, game: Phaser.Game) {
            this.name = name;
            this.hp = hp;
            this.originalHp = hp;
            this.sprite = sprite;

            game.physics.arcade.enable(this.sprite);

            this.setCoolDownPauses(game);
            this.resetFirstFireCoolDown(game);
            this.resetSecondFireCoolDown(game);

            this.createExplosion(game);
        }

        public getSprite() : Phaser.Sprite {
            return this.sprite;
        }

        public getFirstBullets() : Phaser.Group {
            return this.firstBullets;
        }

        public getSecondBullets() : Phaser.Group {
            return this.secondBullets;
        }

        public fire(game: Phaser.Game) {
            if(!this.isAlive()) {
                return;
            }

            this.fireFirst(game);
            this.fireSecond(game);
        }

        public isAlive() {
            return this.hp > 0;
        }

        public kill() {
            this.hp = 0;
            this.sprite.kill();
            this.firstBullets.removeAll(true);
            this.secondBullets.removeAll(true);
        }

        protected canFire(game: Phaser.Game, fireCoolDown: number): boolean {
            return game.time.now > fireCoolDown;
        }

        protected fireFirst(game: Phaser.Game) {
            if (this.target && this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);

                this.firstBullets.setAll('rotation', game.physics.arcade.angleBetween(this.sprite, this.target.getSprite()));

                let bullet = this.firstBullets.getFirstExists(false);
                bullet.___damage = game.rnd.between(0, this.firstBulletsMaxDamage);
                bullet.reset(this.sprite.x, this.sprite.y);

                game.physics.arcade.moveToObject(bullet, this.target.getSprite(), this.firstBulletsSpeed);
            }
        }

        protected fireSecond(game: Phaser.Game) {
            if (this.target && this.canFire(game, this.secondFireCoolDown) && this.secondBullets.countDead() > 0) {
                this.resetSecondFireCoolDown(game);

                this.secondBullets.setAll('rotation', game.physics.arcade.angleBetween(this.sprite, this.target.getSprite()));

                let bullet = this.secondBullets.getFirstExists(false);
                bullet.___damage = game.rnd.between(0, this.secondBulletsMaxDamage);
                bullet.reset(this.sprite.x, this.sprite.y);

                game.physics.arcade.moveToObject(bullet, this.target.getSprite(), this.secondBulletsSpeed);
            }
        }

        protected resetFirstFireCoolDown(game: Phaser.Game) {
            this.firstFireCoolDown = game.time.now + this.firstFireCoolDownPause;
        }

        protected resetSecondFireCoolDown(game: Phaser.Game) {
            this.secondFireCoolDown = game.time.now + this.secondFireCoolDownPause;
        }
    }

    abstract class BadCharacter extends Character {
        currentTint: number;

        update(game: Phaser.Game) {
            if(this.hp <= 0) {
                return;
            }

            let temp = [];
            for(let building of this.buildings) {
                if(building.isAlive()) {
                    temp.push(building);
                }
                game.physics.arcade.overlap(this.firstBullets, building.getSprite(), building.bulletHit, null, building);
                game.physics.arcade.overlap(this.secondBullets, building.getSprite(), building.bulletHit, null, building);
            }
            this.buildings = temp;

            game.physics.arcade.overlap(this.firstBullets, this.player.getSprite(), this.player.bulletHit, null, this.player);
            game.physics.arcade.overlap(this.secondBullets, this.target.getSprite(), this.target.bulletHit, null, this.target);

            this.target = this.player;
            if((game.rnd.between(1, 9) % 3) != 0) {
                this.target = this.buildings[game.rnd.between(0, this.buildings.length - 1)];
                if(this.target && !this.target.isAlive()) {
                    this.target = this.player;
                }
            }

            this.fire(game);
        }

        checkBulletHit(game: Phaser.Game, bullets: Phaser.Group) {
            game.physics.arcade.overlap(bullets, this.sprite, this.bulletHit, null, this);
        }
    }

    abstract class Scene implements Updateable {
        player: Player;
        enemies: any;
        enemiesTotal: number;
        buildings: any;
        running: boolean;
        restartPause: number;

        constructor(player:Player, game: Phaser.Game) {
            this.player = player;
            this.enemies = [];
            this.buildings = [];
            this.running = true;
            this.restartPause  = game.time.now;

            let randomLayoutPresetIndex = game.rnd.between(0, Building.layoutPresets.length - 1);
            for(let presetIndex in Building.layoutPresets[randomLayoutPresetIndex]) {
                this.buildings.push(
                    new Building(
                        presetIndex,
                        Building.layoutPresets[randomLayoutPresetIndex][presetIndex],
                        game
                    )
                );
            }
        }

        update(game: Phaser.Game) {
            if(!this.running) {
                if ((game.time.now > this.restartPause + 2000) &&
                    game.input.activePointer.isDown) {
                    game.state.start('Intro');
                }
                return;
            }

            if(!this.player.isAlive()) {
                this.gameLost(game);
                return;
            }

            let enemiesAlive = false;
            for (let enemy of this.enemies)
            {
                enemy.update(game);
                enemy.checkBulletHit(game, this.player.getFirstBullets());

                enemiesAlive = enemiesAlive || enemy.isAlive();
                if(!enemy.isAlive()) {
                    enemy.kill();
                }
            }

            if(!enemiesAlive) {
                this.gameWon(game);
                return;
            }

            let buildingsAlive = false;
            for (let building of this.buildings)
            {
                building.update(game);
                buildingsAlive = buildingsAlive || building.isAlive();
            }

            if(!buildingsAlive) {
                this.gameLost(game);
                return;
            }
        }

        private stop(game: Phaser.Game) {
            this.running = false;
            this.player.kill();
            for(let enemy of this.enemies) {
                enemy.kill();
            }
        }

        private gameWon(game: Phaser.Game) {
            this.stop(game);

            var style = { font: "bold 32px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" };
            let text = game.add.text(0, 0, "You have won! The city is saved!", style);
            text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            text.setTextBounds(0, 100, 800, 100);

            let text2 = game.add.text(0, 0, "The people rejoice!", style);
            text2.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            text2.setTextBounds(0, 170, 800, 100);

            var style = { font: "bold 24px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" };
            let text3 = game.add.text(0, 0, "click here to restart", style);
            text3.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            text3.setTextBounds(0, 240, 800, 100);

            this.restartPause = game.time.now;
        }

        private gameLost(game: Phaser.Game) {
            this.stop(game);

            var style = { font: "bold 32px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" };
            let text = game.add.text(0, 0, "You have lost! The city is destroyed!", style);
            text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            text.setTextBounds(0, 100, 800, 100);

            let text2 = game.add.text(0, 0, "But the sun will rise and tomorrow is another day!", style);
            text2.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            text2.setTextBounds(0, 170, 800, 100);

            var style = { font: "bold 24px Arial", fill: "#000", boundsAlignH: "center", boundsAlignV: "middle" };
            let text3 = game.add.text(0, 0, "click here to restart", style);
            text3.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            text3.setTextBounds(0, 240, 800, 100);

            this.restartPause = game.time.now;
        }
    }

    class Player extends Character {
        constructor(sprite: Phaser.Sprite, game: Phaser.Game) {
            super("WeatherMan", game.rnd.between(3000, 5000), sprite, game);

            this.sprite.body.bounce.y = 0.2;
            this.sprite.body.gravity.y = 400;
            this.sprite.body.collideWorldBounds = true;

            this.sprite.animations.add('left', [0, 1, 2, 3], 10, true);
            this.sprite.animations.add('right', [5, 6, 7, 8], 10, true);

            this.firstBulletsMaxDamage = game.rnd.between(20, 50);
            this.firstBulletsSpeed = 400;

            this.firstBullets = game.add.group();
            this.firstBullets.enableBody = true

            this.firstBullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.firstBullets.createMultiple(1, 'bullet', 0, false);
            this.firstBullets.setAll('anchor.x', 0.5);
            this.firstBullets.setAll('anchor.y', 0.5);
            this.firstBullets.setAll('outOfBoundsKill', true);
            this.firstBullets.setAll('checkWorldBounds', true);

            this.secondBullets = game.add.group();
        }

        protected setCoolDownPauses(game) {
            this.firstFireCoolDownPause = game.rnd.between(100, 200);
        }

        update(game: Phaser.Game) {
            this.sprite.tint = 0xffffff;
        }

        fire(game: Phaser.Game) {
            if (this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);

                let bullet = this.firstBullets.getFirstExists(false);
                bullet.lifespan = 250;
                bullet.___damage = game.rnd.between(10, 20);
                bullet.reset(this.sprite.x, this.sprite.y);
                bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer);
            }
        }

        bulletHit(object, bullet) {
            bullet.kill();

            this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;

            if(this.hp <= 0) {
                this.playExplosion(this.sprite.x, this.sprite.y);
                this.kill();
            }
        }

        move(velocity: number, direction: string) {
            this.sprite.body.velocity.x = velocity;
            this.sprite.animations.play(direction);
        }

        moveUp(velocity: number) {
            this.sprite.body.velocity.y = velocity;
        }

        stop() {
            this.sprite.animations.stop();
            this.sprite.frame = 4;
        }

        isTouchingDown() {
            return this.sprite.body.touching.down;
        }
    }

    class Cloud extends BadCharacter {
        constructor(sprite: Phaser.Sprite, game: Phaser.Game, i: number, hp: number, player: Player, buildings: any) {
            super("Cloud" + i, hp, sprite, game);

            this.sprite.body.collideWorldBounds = true;
            this.currentTint = MainGame.rgb2hex(96, 96, 96);
            this.sprite.tint = this.currentTint;
            this.sprite.anchor.setTo(0.5, 0.5);

            this.firstBulletsMaxDamage = game.rnd.between(20, 70);
            this.secondBulletsMaxDamage = game.rnd.between(150, 300);

            this.firstBulletsSpeed = 400;
            this.secondBulletsSpeed = 600;

            this.player = player;
            this.target = player;
            this.buildings = buildings;

            this.firstBullets = game.add.group();
            this.firstBullets.enableBody = true;
            this.firstBullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.firstBullets.createMultiple(1, 'raindrop');

            this.firstBullets.setAll('anchor.x', 0.5);
            this.firstBullets.setAll('anchor.y', 0.5);
            this.firstBullets.setAll('outOfBoundsKill', true);
            this.firstBullets.setAll('checkWorldBounds', true);

            this.secondBullets = game.add.group();
            this.secondBullets.enableBody = true;
            this.secondBullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.secondBullets.createMultiple(1, 'lightning', 0, false);

            this.secondBullets.setAll('anchor.x', 0.5);
            this.secondBullets.setAll('anchor.y', 0.5);
            this.secondBullets.setAll('outOfBoundsKill', true);
            this.secondBullets.setAll('checkWorldBounds', true);
        }

        protected setCoolDownPauses(game) {
            this.firstFireCoolDownPause = game.rnd.between(100, 400);
            this.secondFireCoolDownPause = game.rnd.between(700, 2000);
        }

        update(game: Phaser.Game) {
            this.sprite.tint = this.currentTint;
            super.update(game);
        }

        bulletHit(object, bullet) {
            bullet.kill();

            this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;

            let scale: number = this.hp / this.originalHp;
            scale = scale < .10 ? .10 : scale;
            this.sprite.scale.setTo(scale, scale);

            let newTint = Math.round((1.0 - scale) * (255 - 96) + 96);
            this.currentTint = MainGame.rgb2hex(newTint, newTint, newTint);

            if (this.hp <= 0)
            {
                this.playExplosion(this.sprite.x, this.sprite.y);
                this.kill();
                return true;
            }

            return false;
        }
    }

    class Sun extends BadCharacter {
        rotationSpeed: number;
        rotationSpeedIncrementor: number;

        constructor(sprite: Phaser.Sprite, game: Phaser.Game, i: number, hp: number, player: Player, buildings: any) {
            super("Sun" + i, hp, sprite, game);

            this.currentTint = 0xffffff;
            this.sprite.tint = this.currentTint;
            this.sprite.anchor.setTo(0.5, 0.5);
            this.rotationSpeed = 0.025;
            this.rotationSpeedIncrementor = 0.005;

            this.firstBulletsMaxDamage = game.rnd.between(50, 100);
            this.secondBulletsMaxDamage = game.rnd.between(200, 500);

            this.firstBulletsSpeed = 400;
            this.secondBulletsSpeed = 300;

            this.target = player;
            this.player = player;
            this.buildings = buildings;

            this.firstBullets = game.add.group();
            this.firstBullets.enableBody = true;
            this.firstBullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.firstBullets.createMultiple(12, 'sunray');

            this.firstBullets.setAll('anchor.x', 0.5);
            this.firstBullets.setAll('anchor.y', 0.5);
            this.firstBullets.setAll('outOfBoundsKill', true);
            this.firstBullets.setAll('checkWorldBounds', true);

            this.secondBullets = game.add.group();
            this.secondBullets.enableBody = true;
            this.secondBullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.secondBullets.createMultiple(1, 'heatwave', 0, false);

            this.secondBullets.setAll('anchor.x', 0.5);
            this.secondBullets.setAll('anchor.y', 0.5);
            this.secondBullets.setAll('outOfBoundsKill', true);
            this.secondBullets.setAll('checkWorldBounds', true);

            this.sprite.bringToTop();
        }

        setCoolDownPauses(game) {
            this.firstFireCoolDownPause = game.rnd.between(1200, 1600);
            this.secondFireCoolDownPause = game.rnd.between(800, 1200);
        }

        protected fireFirst(game: Phaser.Game) {
            if (this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);

                let angle = 0;
                this.firstBullets.forEach(function(bullet) {
                    bullet.reset(this.sprite.x + this.sprite.anchor.x, this.sprite.y + this.sprite.anchor.y);
                    bullet.___damage = game.rnd.between(0, this.firstBulletsMaxDamage);
                    bullet.rotation = angle;

                    game.physics.arcade.moveToXY(bullet, this.sprite.x + 20000 * Math.cos(angle),
                        this.sprite.y + 20000 * Math.sin(angle), this.firstBulletsSpeed);

                    angle += 15;
                }, this);
            }
        }

        update(game: Phaser.Game) {
            this.rotationSpeed -= this.rotationSpeedIncrementor;
            this.sprite.rotation += this.rotationSpeed;
            this.sprite.tint = this.currentTint;

            super.update(game);
        }

        bulletHit(object, bullet) {
            bullet.kill();

            this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;
            this.rotationSpeedIncrementor += 0.0002;

            this.firstFireCoolDownPause -= 50;
            if(this.firstFireCoolDownPause < 600) {
                this.firstFireCoolDownPause = 600;
            }

            this.firstBulletsSpeed += 20;
            if(this.firstBulletsSpeed > 1000) {
                this.firstBulletsSpeed = 1000;
            }

            let scale: number = this.hp / this.originalHp;
            scale = scale < 0.40 ? 0.40 : scale;
            this.sprite.scale.setTo(scale, scale);

            if (this.hp <= 0) {
                this.playExplosion(this.sprite.x, this.sprite.y);
                this.kill();
                return true;
            }

            return false;
        }
    }

    class Building implements Updateable, HasSprite {
        public static layoutPresets: any = [
            {'2' : 20, '5' : 150, '7' : 400, '1': 700},
            {'5' : 50, '7' : 300, '2' : 700},
            {'1' : 50, '4' : 150, '5': 400, '2' : 670},
            {'5' : 50, '7' : 300, '1' : 670},
        ];

        sprite: Phaser.Sprite;
        hp: number
        originalHp: number
        id: string;
        explosions: Phaser.Group;

        createExplosion: (game: Phaser.Game) => void;
        playExplosion: (x: number, y: number) => void;

        constructor(id: string, x:number, game: Phaser.Game) {
            this.id = id
            this.hp = game.rnd.between(1000, 3000);
            this.originalHp = this.hp;

            this.sprite = game.add.sprite(x, 0, 'building' + this.id, 'building' + this.id + '_1.png');
            this.sprite.y = game.world.height - 64 - this.sprite.height;
            this.sprite.tint = 0xffffff;

            game.physics.arcade.enable(this.sprite);

            this.createExplosion(game);
        }

        public getId() {
            return this.id;
        }

        public getSprite(): Phaser.Sprite {
            return this.sprite;
        }

        public update(game: Phaser.Game) {
        }

        public isAlive() {
            return this.hp > 0;
        }

        bulletHit(object, bullet): boolean {
            bullet.kill();

            this.hp -= bullet.___damage;

            this.playExplosion(this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2);

            switch(true) {
                case this.hp <= 0:
                    this.sprite.frameName = 'building' + this.id + '_5.png';
                    break;
                case this.hp < (0.2 * this.originalHp):
                    this.sprite.frameName = 'building' + this.id + '_4.png';
                    break;
                case this.hp < (0.6 * this.originalHp):
                    this.sprite.frameName = 'building' + this.id + '_3.png';
                    break;
                case this.hp < (0.9 * this.originalHp):
                    this.sprite.frameName = 'building' + this.id + '_2.png';
                    break;
            }

            if (this.hp <= 0)
            {
                this.explosions.destroy();
                return true;
            }

            return false;
        }
    }

    class CloudScene extends Scene {
        constructor(player:Player, game: Phaser.Game) {
            super(player, game);

            this.enemiesTotal = 6;
            for (let i = 0; i < this.enemiesTotal; i++)
            {
                this.enemies.push(
                    new Cloud(
                        game.add.sprite(120 * i + game.rnd.between(0, 20), game.rnd.between(40, 160), 'stormcloud'),
                        game,
                        i,
                        game.rnd.between(200, 500),
                        player,
                        this.buildings
                    )
                );
            }
        }
    }

    class SunScene extends Scene {
        constructor(player:Player, game: Phaser.Game) {
            super(player, game);

            this.enemiesTotal = 1;
            for (let i = 0; i < this.enemiesTotal; i++)
            {
                this.enemies.push(
                    new Sun(
                        game.add.sprite(400, 0, 'sun'),
                        game,
                        i,
                        game.rnd.between(1000, 3000),
                        player,
                        this.buildings
                    )
                );
            }
        }
    }
}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}