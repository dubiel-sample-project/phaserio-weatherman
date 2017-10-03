/// <reference path="phaser.d.ts" />

export module Weatherman {
    export class Game {

        static rgb2hex(red, green, blue) {
            return blue | (green << 8) | (red << 16);
        }

        game: Phaser.Game;
        platforms: Phaser.Group;
        cursors: Phaser.CursorKeys;
        player: Player;
        scene: Scene;
        buildings: any;

        // score: number = 0;
        // scoreText: string;

        constructor() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
        }

        preload() {
            this.game.load.image('sky', 'assets/sky.png');
            this.game.load.image('ground', 'assets/platform.png');
            this.game.load.image('star', 'assets/star.png');
            this.game.load.spritesheet('weatherman', 'assets/dude.png', 32, 48);
            this.game.load.image('bullet', 'assets/bullet.png');
            this.game.load.image('raindrop', 'assets/raindrop.png');
            this.game.load.image('stormcloud', 'assets/stormcloud3.png');
            this.game.load.image('lightning', 'assets/lightning.png');
            this.game.load.image('sun', 'assets/sun7.png');
            this.game.load.image('sunray', 'assets/sunray3.png');
            this.game.load.image('heatwave', 'assets/heatwave2.png');
            this.game.load.spritesheet('explosion', 'assets/explosion.png', 64, 64, 23);
            this.game.load.atlas('building2', 'assets/building2.png', 'assets/building2.json');
            this.game.load.atlas('building5', 'assets/building5.png', 'assets/building5.json');
            this.game.load.atlas('building7', 'assets/building7.png', 'assets/building7.json');
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

            // this.scene = new CloudScene(this.player, this.game);
            this.scene = new SunScene(this.player, this.game);
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

    interface Fireable {
        fire(game: Phaser.Game);
    }

    interface Updateable {
        update(game: Phaser.Game);
    }

    interface HasSprite {
        getSprite(): Phaser.Sprite;
    }

    abstract class Character implements Fireable, Updateable, HasSprite {
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
        abstract setCoolDownPauses(game: Phaser.Game);

        constructor(name: string, hp: number, sprite: Phaser.Sprite, game: Phaser.Game) {
            this.name = name;
            this.hp = hp;
            this.originalHp = hp;
            this.sprite = sprite;

            game.physics.arcade.enable(this.sprite);

            this.setCoolDownPauses(game);
            this.resetFirstFireCoolDown(game);
            this.resetSecondFireCoolDown(game);

            this.explosions = game.add.group();

            var explosionAnimation = this.explosions.create(0, 0, 'explosion', 0, false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.animations.add('explosion');
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
            this.sprite.kill();
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
                bullet.reset(this.sprite.x + this.sprite.anchor.x, this.sprite.y + this.sprite.anchor.y);

                game.physics.arcade.moveToObject(bullet, this.target.getSprite(), this.firstBulletsSpeed);
            }
        }

        protected fireSecond(game: Phaser.Game) {
            if (this.target && this.canFire(game, this.secondFireCoolDown) && this.secondBullets.countDead() > 0) {
                this.resetSecondFireCoolDown(game);

                this.secondBullets.setAll('rotation', game.physics.arcade.angleBetween(this.sprite, this.target.getSprite()));

                let bullet = this.secondBullets.getFirstExists(false);
                bullet.___damage = game.rnd.between(0, this.secondBulletsMaxDamage);
                bullet.reset(this.sprite.x + this.sprite.anchor.x, this.sprite.y + this.sprite.anchor.y);

                game.physics.arcade.moveToObject(bullet, this.target.getSprite(), this.secondBulletsSpeed);
            }
        }

        protected resetFirstFireCoolDown(game: Phaser.Game) {
            this.firstFireCoolDown = game.time.now + this.firstFireCoolDownPause;
        }

        protected resetSecondFireCoolDown(game: Phaser.Game) {
            this.secondFireCoolDown = game.time.now + this.secondFireCoolDownPause;
        }

        protected playExplosion() {
            var explosionAnimation = this.explosions.getFirstExists(false);
            if(explosionAnimation) {
                explosionAnimation.reset(this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2);
                explosionAnimation.play('explosion', 30, false, true);
            }
        }
    }

    abstract class Scene implements Updateable {
        player: Player;
        enemies: any;
        enemiesTotal: number;
        buildings: any;

        constructor(player:Player, game: Phaser.Game) {
            this.player = player;
            this.enemies = [];
            this.buildings = [];
        }

        update(game: Phaser.Game) {

            let enemiesAlive = false;
            for (let enemy of this.enemies)
            {
                enemy.update(game);
                enemy.checkBulletHit(game, this.player.getFirstBullets());
                enemy.checkBulletHit(game, this.player.getSecondBullets());

                enemiesAlive = enemiesAlive || enemy.isAlive();
                if(!enemy.isAlive()) {
                    enemy.kill();
                    // enemy = null;
                }
            }

            if(!enemiesAlive) {
                console.log('you won');
            }

            let buildingsAlive = false;
            for (let building of this.buildings)
            {
                building.update(game);
                buildingsAlive = buildingsAlive || building.isAlive();
            }

            if(!buildingsAlive) {
                console.log('you lost');
            }
        }
    }

    class Player extends Character {
        constructor(sprite: Phaser.Sprite, game: Phaser.Game) {
            super("WeatherMan", 100, sprite, game);

            this.sprite.body.bounce.y = 0.2;
            this.sprite.body.gravity.y = 300;
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
        }

        setCoolDownPauses(game) {
            this.firstFireCoolDownPause = game.rnd.between(100, 200);
        }

        update(game: Phaser.Game) {

        }

        fire(game: Phaser.Game) {
            console.log('player.fire');

            if (this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);

                let bullet = this.firstBullets.getFirstExists(false);
                bullet.___damage = game.rnd.between(10, 20);
                bullet.reset(this.sprite.x, this.sprite.y);
                bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
            }

            // if (this.canFire(game, this.secondFireCoolDown) && this.secondBullets.countDead() > 0) {
            //     this.resetSecondFireCoolDown(game);
            //
            //     // let bullet = this.firstBullets.getFirstExists(false);
            //     // bullet.___damage = this.game.rnd.between(0, 20);
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
        currentTint: number;

        constructor(sprite: Phaser.Sprite, game: Phaser.Game, i: number, player: Player, buildings: any) {
            super("Cloud" + i, 200, sprite, game);

            this.sprite.body.collideWorldBounds = true;
            // this.currentTint = Phaser.Color.toABGR(255, 96, 96, 96);
            this.currentTint = Game.rgb2hex(96, 96, 96);
            this.sprite.tint = this.currentTint;
            this.sprite.anchor.setTo(0.5, 0.5);


            this.firstBulletsMaxDamage = game.rnd.between(5, 10);
            this.secondBulletsMaxDamage = game.rnd.between(50, 100);

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

        setCoolDownPauses(game) {
            this.firstFireCoolDownPause = game.rnd.between(300, 600);
            this.secondFireCoolDownPause = game.rnd.between(3000, 5000);
        }

        update(game: Phaser.Game) {
           if(!this.isAlive()) {
               return;
           }

           this.target = this.player;
           if((game.rnd.between(1, 5) % 2) != 0) {
                let length = this.buildings.length;
                let index = game.rnd.between(0, length - 1);
                this.target = this.buildings[index];
           }

            game.physics.arcade.overlap(this.firstBullets, this.target.getSprite(), this.target.bulletHit, null, this.target);
            game.physics.arcade.overlap(this.secondBullets, this.target.getSprite(), this.target.bulletHit, null, this.target);
            this.sprite.tint = this.currentTint;

            this.fire(game);
        }

        checkBulletHit(game: Phaser.Game, bullets: Phaser.Group) {
            game.physics.arcade.overlap(bullets, this.sprite, this.bulletHit, null, this);
        }

        bulletHit(object, bullet) {
            bullet.kill();

            this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;

            let scale: number = this.hp / this.originalHp;
            scale = scale < .25 ? .25 : scale;
            this.sprite.scale.setTo(scale, scale);

            let newTint = Math.round((1.0 - scale) * (255 - 96) + 96);
            this.currentTint = Game.rgb2hex(newTint, newTint, newTint);

            if (this.hp <= 0)
            {
                this.firstBullets.removeAll(true);
                this.secondBullets.removeAll(true);
                return true;
            }

            return false;
        }
    }

    class Sun extends Character {
        currentTint: number;
        rotationSpeed: number;

        constructor(sprite: Phaser.Sprite, game: Phaser.Game, i: number, player: Player, buildings: any) {
            super("Sun" + i, 500, sprite, game);

            this.currentTint = 0xffffff;
            this.sprite.tint = this.currentTint;
            this.sprite.anchor.setTo(0.5, 0.5);
            this.rotationSpeed = 0.025;

            this.firstBulletsMaxDamage = game.rnd.between(20, 50);
            this.secondBulletsMaxDamage = game.rnd.between(100, 300);

            this.firstBulletsSpeed = 400;
            this.secondBulletsSpeed = 200;

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

            // this.sprite.bringToTop();
        }

        setCoolDownPauses(game) {
            this.firstFireCoolDownPause = game.rnd.between(900, 1200);
            this.secondFireCoolDownPause = game.rnd.between(600, 1000);
        }

        protected fireFirst(game: Phaser.Game) {
            if (this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);

                let angle = 0;
                this.firstBullets.forEach(function(bullet) {
                    bullet.reset(this.sprite.x + this.sprite.anchor.x, this.sprite.y + this.sprite.anchor.y);
                    bullet.___damage = game.rnd.between(0, this.firstBulletsMaxDamage);
                    bullet.angle = angle;

                    game.physics.arcade.moveToXY(bullet, this.sprite.x + 20000 * Math.cos(angle),
                        this.sprite.y + 20000 * Math.sin(angle), this.firstBulletsSpeed);

                    angle += 15;
                }, this);
            }
        }

        update(game: Phaser.Game) {
            if(this.hp <= 0) {
                return;
            }

            this.rotationSpeed -= 0.002;
            this.sprite.rotation += this.rotationSpeed;
            this.sprite.tint = this.currentTint;

            this.target = this.player;
            if((game.rnd.between(1, 5) % 2) != 0) {
                let length = this.buildings.length;
                let index = game.rnd.between(0, length - 1);
                this.target = this.buildings[index];
            }

            game.physics.arcade.overlap(this.secondBullets, this.target.getSprite(), this.target.bulletHit, null, this.target);
            this.fireSecond(game);

            for(let building of this.buildings) {
                game.physics.arcade.overlap(this.firstBullets, building.getSprite(), building.bulletHit, null, building);
            }
            this.fireFirst(game);
        }

        checkBulletHit(game: Phaser.Game, bullets: Phaser.Group) {
            game.physics.arcade.overlap(bullets, this.sprite, this.bulletHit, null, this);
        }

        bulletHit(object, bullet) {
            // console.log('sun.bulletHit');

            bullet.kill();
            this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;
            // this.sprite.y -= 1;

            let scale: number = this.hp / this.originalHp;
            scale = scale < .40 ? .40 : scale;
            this.sprite.scale.setTo(scale, scale);

            if (this.hp <= 0)
            {
                // this.sprite.kill();
                this.playExplosion();
                this.firstBullets.removeAll(true);
                this.secondBullets.removeAll(true);
                return true;
            }

            return false;
        }
    }

    class Building implements Updateable, HasSprite {
        sprite: Phaser.Sprite;
        hp: number
        id: string;
        explosions: Phaser.Group;

        constructor(id: string, game: Phaser.Game) {
            this.id = id
            this.hp = 100;

            this.sprite = game.add.sprite(0, 0, 'building' + this.id, 'building' + this.id + '_1.png');
            this.sprite.x = 50;
            this.sprite.y = game.world.height - 64 - this.sprite.height;
            this.sprite.tint = 0xffffff;

            game.physics.arcade.enable(this.sprite);

            this.explosions = game.add.group();

            var explosionAnimation = this.explosions.create(0, 0, 'explosion', 0, false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.animations.add('explosion');
        }

        public getSprite(): Phaser.Sprite {
            return this.sprite;
        }

        public update(game: Phaser.Game) {
            // this.sprite.tint = 0xffffff;
        }

        public isAlive() {
            return this.hp > 0;
        }

        bulletHit(object, bullet): boolean {
            // console.log('building.bulletHit');

            bullet.kill();
            // this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;

            switch(true) {
                case this.hp < 10:
                    this.playExplosion();
                    this.sprite.frameName = 'building' + this.id + '_5.png';
                    break;
                case this.hp < 30:
                    this.playExplosion();
                    this.sprite.frameName = 'building' + this.id + '_4.png';
                    break;
                case this.hp < 60:
                    this.playExplosion();
                    this.sprite.frameName = 'building' + this.id + '_3.png';
                    break;
                case this.hp < 90:
                    this.playExplosion();
                    this.sprite.frameName = 'building' + this.id + '_2.png';
                    break;
            }

            if (this.hp <= 0)
            {
                // this.sprite.kill();
                this.explosions.destroy();
                return true;
            }

            return false;
        }

        private playExplosion() {
            var explosionAnimation = this.explosions.getFirstExists(false);
            if(explosionAnimation) {
                explosionAnimation.reset(this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2);
                explosionAnimation.play('explosion', 30, false, true);
            }
        }
    }

    class CloudScene extends Scene {
        constructor(player:Player, game: Phaser.Game) {
            super(player, game);

            this.enemiesTotal = 4;
            this.buildings.push(new Building(
                '2',
                game
            ));

            for (let i = 0; i < this.enemiesTotal; i++)
            {
                this.enemies.push(
                    new Cloud(
                        game.add.sprite(200 * i + game.rnd.between(0, 20), game.rnd.between(0, 20), 'stormcloud'),
                        game,
                        i,
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
            this.buildings.push(
                new Building(
                    '2',
                    game
                ),
                new Building(
                    '5',
                    game
                ),
                new Building(
                    '7',
                    game
                ),
            );

            for (let i = 0; i < this.enemiesTotal; i++)
            {
                this.enemies.push(
                    new Sun(
                        game.add.sprite(400, 0, 'sun'),
                        game,
                        i,
                        player,
                        this.buildings
                    )
                );
            }
        }
    }
}
