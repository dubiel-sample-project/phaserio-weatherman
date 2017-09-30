/// <reference path="phaser.d.ts" />

export module Weatherman {
    export class Game {
        game: Phaser.Game;
        platforms: Phaser.Group;
        cursors: Phaser.CursorKeys;
        player: Player;
        playerBullets: Phaser.Group;
        enemyBullets: Phaser.Group;
        enemies: any;
        enemiesTotal: number;

        score: number = 0;
        scoreText: string;

        constructor() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
        }

        preload() {
            this.game.load.image('sky', 'assets/sky.png');
            this.game.load.image('ground', 'assets/platform.png');
            this.game.load.image('star', 'assets/star.png');
            this.game.load.spritesheet('weatherman', 'assets/dude.png', 32, 48);
            this.game.load.image('bullet', 'assets/bullet.png');
            this.game.load.image('stormcloud', 'assets/stormcloud.png');
            this.game.load.image('lightning', 'assets/lightning.png');
        }

        create() {
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

            this.enemiesTotal = 4;
            this.enemies = [];

            for (let i = 0; i < this.enemiesTotal; i++)
            {
                this.enemies.push(
                    new Cloud(
                        this.game.add.sprite(200 * i + this.game.rnd.realInRange(0, 20), this.game.rnd.realInRange(0, 20), 'stormcloud'),
                        this.game,
                        i,
                        this.player
                    )
                );
            }

            console.log(this.enemies);

            this.cursors = this.game.input.keyboard.createCursorKeys();
        }

        update() {
            this.game.physics.arcade.collide(this.player.getSprite(), this.platforms);

            this.player.update(this.game);

            for (let enemy of this.enemies)
            {
                enemy.update(this.game);
                enemy.checkBulletHit(this.game, this.player.getFirstBullets());
                enemy.checkBulletHit(this.game, this.player.getSecondBullets());
            }

            this.player.move(0, 'left');

            if (this.cursors.left.isDown)
            {
                console.log('left');
                this.player.move(-150, 'left');
            }
            else if (this.cursors.right.isDown)
            {
                console.log('right');
                this.player.move(150, 'right');
            }
            else
            {
                this.player.stop();
            }

            if (this.cursors.up.isDown)
            {
                console.log('up');
                this.player.moveUp(-350);
            }

            if (this.game.input.activePointer.isDown)
            {
                this.player.fire(this.game);
            }
        }
    }

    abstract class Character {
        name: string;
        hp: number;
        originalHp: number;
        sprite: Phaser.Sprite
        firstBullets: Phaser.Group;
        secondBullets: Phaser.Group;
        firstFireCoolDown: number;
        secondFireCoolDown: number;

        abstract update(game: Phaser.Game);
        abstract fire(game: Phaser.Game);

        constructor(name: string, hp: number, sprite: Phaser.Sprite, game: Phaser.Game) {
            this.name = name;
            this.hp = hp;
            this.originalHp = hp;
            this.sprite = sprite;

            game.physics.arcade.enable(this.sprite);

            this.resetFirstFireCoolDown(game);
            this.resetSecondFireCoolDown(game);
        }

        getSprite() : Phaser.Sprite {
            return this.sprite;
        }

        getFirstBullets() : Phaser.Group {
            return this.firstBullets;
        }

        getSecondBullets() : Phaser.Group {
            return this.secondBullets;
        }

        resetFirstFireCoolDown(game: Phaser.Game) {
            this.firstFireCoolDown = game.time.now + game.rnd.realInRange(0, 500);
        }

        resetSecondFireCoolDown(game: Phaser.Game) {
            this.secondFireCoolDown = game.time.now + game.rnd.realInRange(0, 1000);
        }

        canFire(game: Phaser.Game, fireCoolDown: number): boolean {
            return game.time.now > fireCoolDown;
        }
    }

    abstract class Bullet {
        x: number;
        y: number;
        speed: number;
    }

    class Player extends Character {
        constructor(sprite: Phaser.Sprite, game: Phaser.Game) {
            super("WeatherMan", 100, sprite, game);

            this.sprite.body.bounce.y = 0.2;
            this.sprite.body.gravity.y = 300;
            this.sprite.body.collideWorldBounds = true;

            this.sprite.animations.add('left', [0, 1, 2, 3], 10, true);
            this.sprite.animations.add('right', [5, 6, 7, 8], 10, true);

            this.firstBullets = game.add.group();
            this.firstBullets.enableBody = true;
            this.firstBullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.firstBullets.createMultiple(10, 'bullet', 0, false);
            this.firstBullets.setAll('anchor.x', 0.5);
            this.firstBullets.setAll('anchor.y', 0.5);
            this.firstBullets.setAll('outOfBoundsKill', true);
            this.firstBullets.setAll('checkWorldBounds', true);
        }

        update(game: Phaser.Game) {

        }

        fire(game: Phaser.Game) {
            console.log('player.fire');

            if (this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);

                let bullet = this.firstBullets.getFirstExists(false);
                bullet.___damage = game.rnd.realInRange(0,20);
                bullet.reset(this.sprite.x, this.sprite.y);
                bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
            }

            // if (this.canFire(game, this.secondFireCoolDown) && this.secondBullets.countDead() > 0) {
            //     this.resetSecondFireCoolDown(game);
            //
            //     // let bullet = this.firstBullets.getFirstExists(false);
            //     // bullet.___damage = this.game.rnd.realInRange(0, 20);
            //     // bullet.reset(this.sprite.x, this.sprite.y);
            //     // bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
            // }
        }

        bulletHit(object, bullet) {
            // console.log('player.bulletHit');
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

    class Cloud extends Character {
        player: Player;

        constructor(sprite: Phaser.Sprite, game: Phaser.Game, i: number, player: Player) {
            super("Cloud" + i, 200, sprite, game);

            this.sprite.body.collideWorldBounds = true;
            this.player = player;

            this.firstBullets = game.add.group();
            this.firstBullets.enableBody = true;
            this.firstBullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.firstBullets.createMultiple(1, 'bullet');

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

        update(game: Phaser.Game) {
            game.physics.arcade.overlap(this.firstBullets, this.player.getSprite(), this.player.bulletHit, null, this.player);
            this.sprite.tint = 0xffffff;

            this.fire(game);
        }

        fire(game: Phaser.Game) {
            if (this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);

                let bullet = this.firstBullets.getFirstExists(false);
                bullet.___damage = game.rnd.realInRange(0, 10);
                bullet.reset(this.sprite.x + game.rnd.realInRange(0, this.sprite.width),
                    this.sprite.y + game.rnd.realInRange(0,this.sprite.height));
                bullet.rotation = game.physics.arcade.moveToObject(bullet, this.player.getSprite(), 500);
            }

            if (this.canFire(game, this.secondFireCoolDown) && this.secondBullets.countDead() > 0) {
                this.resetSecondFireCoolDown(game);

                let bullet = this.secondBullets.getFirstExists(false);
                bullet.___damage = game.rnd.realInRange(0, 50);
                bullet.reset(this.sprite.x + game.rnd.realInRange(0, this.sprite.width),
                    this.sprite.y + game.rnd.realInRange(0, this.sprite.height));
                bullet.rotation = game.physics.arcade.moveToObject(bullet, this.player.getSprite(), 400);
            }
        }

        checkBulletHit(game: Phaser.Game, bullets: Phaser.Group) {
            game.physics.arcade.overlap(bullets, this.sprite, this.bulletHit, null, this);
        }

        bulletHit(object, bullet) {
            console.log('cloud.bulletHit');

            bullet.kill();
            this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;

            let scale: number = this.hp / this.originalHp;
            this.sprite.scale.setTo(scale, scale);

            if (this.hp <= 0)
            {
                this.sprite.kill();
                this.firstBullets.removeAll(true);
                this.secondBullets.removeAll(true);
                return true;
            }

            return false;
        }
    }
}
