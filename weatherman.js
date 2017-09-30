"use strict";
/// <reference path="phaser.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Weatherman;
(function (Weatherman) {
    var Game = /** @class */ (function () {
        function Game() {
            this.score = 0;
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
        }
        Game.prototype.preload = function () {
            this.game.load.image('sky', 'assets/sky.png');
            this.game.load.image('ground', 'assets/platform.png');
            this.game.load.image('star', 'assets/star.png');
            this.game.load.spritesheet('weatherman', 'assets/dude.png', 32, 48);
            this.game.load.image('bullet', 'assets/bullet.png');
            this.game.load.image('stormcloud', 'assets/stormcloud3.png');
            this.game.load.image('lightning', 'assets/lightning.png');
            this.game.load.image('sun', 'assets/sun.png');
            this.game.load.image('sunray', 'assets/sun.png');
            this.game.load.image('heatwave', 'assets/heatwave.png');
            this.game.load.spritesheet('explosion', 'assets/explosion.png', 64, 64, 23);
            this.game.load.atlas('building2', 'assets/building2.png', 'assets/building2.json');
        };
        Game.prototype.create = function () {
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.add.sprite(0, 0, 'sky');
            this.platforms = this.game.add.group();
            this.platforms.enableBody = true;
            var ground = this.platforms.create(0, this.game.world.height - 64, 'ground');
            ground.scale.setTo(2, 2);
            ground.body.immovable = true;
            this.player = new Player(this.game.add.sprite(32, this.game.world.height - 150, 'weatherman'), this.game);
            this.enemiesTotal = 4;
            this.enemies = [];
            for (var i = 0; i < this.enemiesTotal; i++) {
                this.enemies.push(new Cloud(this.game.add.sprite(200 * i + this.game.rnd.realInRange(0, 20), this.game.rnd.realInRange(0, 20), 'stormcloud'), this.game, i, this.player));
            }
            this.cursors = this.game.input.keyboard.createCursorKeys();
        };
        Game.prototype.update = function () {
            this.game.physics.arcade.collide(this.player.getSprite(), this.platforms);
            this.player.update(this.game);
            for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
                var enemy = _a[_i];
                enemy.update(this.game);
                enemy.checkBulletHit(this.game, this.player.getFirstBullets());
                enemy.checkBulletHit(this.game, this.player.getSecondBullets());
            }
            this.player.move(0, 'left');
            if (this.cursors.left.isDown) {
                console.log('left');
                this.player.move(-150, 'left');
            }
            else if (this.cursors.right.isDown) {
                console.log('right');
                this.player.move(150, 'right');
            }
            else {
                this.player.stop();
            }
            if (this.cursors.up.isDown) {
                console.log('up');
                this.player.moveUp(-350);
            }
            if (this.game.input.activePointer.isDown) {
                this.player.fire(this.game);
            }
        };
        return Game;
    }());
    Weatherman.Game = Game;
    var Character = /** @class */ (function () {
        function Character(name, hp, sprite, game) {
            this.name = name;
            this.hp = hp;
            this.originalHp = hp;
            this.sprite = sprite;
            game.physics.arcade.enable(this.sprite);
            this.resetFirstFireCoolDown(game);
            this.resetSecondFireCoolDown(game);
        }
        Character.prototype.getSprite = function () {
            return this.sprite;
        };
        Character.prototype.getFirstBullets = function () {
            return this.firstBullets;
        };
        Character.prototype.getSecondBullets = function () {
            return this.secondBullets;
        };
        Character.prototype.resetFirstFireCoolDown = function (game) {
            this.firstFireCoolDown = game.time.now + game.rnd.realInRange(0, 500);
        };
        Character.prototype.resetSecondFireCoolDown = function (game) {
            this.secondFireCoolDown = game.time.now + game.rnd.realInRange(0, 2000);
        };
        Character.prototype.canFire = function (game, fireCoolDown) {
            return game.time.now > fireCoolDown;
        };
        Character.prototype.fireFirst = function (game) {
            if (this.target && this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);
                var bullet = this.firstBullets.getFirstExists(false);
                bullet.___damage = game.rnd.realInRange(0, this.firstBulletsMaxDamage);
                bullet.reset(this.sprite.x + game.rnd.realInRange(0, this.sprite.width), this.sprite.y + game.rnd.realInRange(0, this.sprite.height));
                game.physics.arcade.moveToObject(bullet, this.target.getSprite(), this.firstBulletsSpeed);
            }
        };
        Character.prototype.fireSecond = function (game) {
            if (this.target && this.canFire(game, this.secondFireCoolDown) && this.secondBullets.countDead() > 0) {
                this.resetSecondFireCoolDown(game);
                this.secondBullets.setAll('rotation', game.physics.arcade.angleBetween(this.sprite, this.target.getSprite()));
                var bullet = this.secondBullets.getFirstExists(false);
                bullet.___damage = game.rnd.realInRange(0, this.secondBulletsMaxDamage);
                bullet.reset(this.sprite.x + game.rnd.realInRange(0, this.sprite.width), this.sprite.y + game.rnd.realInRange(0, this.sprite.height));
                game.physics.arcade.moveToObject(bullet, this.target.getSprite(), this.secondBulletsSpeed);
            }
        };
        return Character;
    }());
    var Player = /** @class */ (function (_super) {
        __extends(Player, _super);
        function Player(sprite, game) {
            var _this = _super.call(this, "WeatherMan", 100, sprite, game) || this;
            _this.sprite.body.bounce.y = 0.2;
            _this.sprite.body.gravity.y = 300;
            _this.sprite.body.collideWorldBounds = true;
            _this.sprite.animations.add('left', [0, 1, 2, 3], 10, true);
            _this.sprite.animations.add('right', [5, 6, 7, 8], 10, true);
            _this.firstBullets = game.add.group();
            _this.firstBullets.enableBody = true;
            _this.firstBullets.physicsBodyType = Phaser.Physics.ARCADE;
            _this.firstBullets.createMultiple(1, 'bullet', 0, false);
            _this.firstBullets.setAll('anchor.x', 0.5);
            _this.firstBullets.setAll('anchor.y', 0.5);
            _this.firstBullets.setAll('outOfBoundsKill', true);
            _this.firstBullets.setAll('checkWorldBounds', true);
            return _this;
        }
        Player.prototype.update = function (game) {
        };
        Player.prototype.fire = function (game) {
            console.log('player.fire');
            if (this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);
                var bullet = this.firstBullets.getFirstExists(false);
                bullet.___damage = game.rnd.realInRange(0, 20);
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
        };
        Player.prototype.bulletHit = function (object, bullet) {
            // console.log('player.bulletHit');
        };
        Player.prototype.move = function (velocity, direction) {
            this.sprite.body.velocity.x = velocity;
            this.sprite.animations.play(direction);
        };
        Player.prototype.moveUp = function (velocity) {
            this.sprite.body.velocity.y = velocity;
        };
        Player.prototype.stop = function () {
            this.sprite.animations.stop();
            this.sprite.frame = 4;
        };
        Player.prototype.isTouchingDown = function () {
            return this.sprite.body.touching.down;
        };
        return Player;
    }(Character));
    var Cloud = /** @class */ (function (_super) {
        __extends(Cloud, _super);
        function Cloud(sprite, game, i, player) {
            var _this = _super.call(this, "Cloud" + i, 200, sprite, game) || this;
            _this.sprite.body.collideWorldBounds = true;
            _this.currentTint = 0x606060;
            _this.sprite.tint = _this.currentTint;
            _this.firstFireCoolDown = game.rnd.realInRange(200, 500);
            _this.secondFireCoolDown = game.rnd.realInRange(600, 1000);
            _this.firstBulletsMaxDamage = game.rnd.realInRange(5, 10);
            _this.secondBulletsMaxDamage = game.rnd.realInRange(50, 100);
            // let explosions = game.add.group();
            //
            //     var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
            //     explosionAnimation.anchor.setTo(0.5, 0.5);
            //     explosionAnimation.animations.add('kaboom');
            _this.target = player;
            _this.firstBullets = game.add.group();
            _this.firstBullets.enableBody = true;
            _this.firstBullets.physicsBodyType = Phaser.Physics.ARCADE;
            _this.firstBullets.createMultiple(1, 'bullet');
            _this.firstBullets.setAll('anchor.x', 0.5);
            _this.firstBullets.setAll('anchor.y', 0.5);
            _this.firstBullets.setAll('outOfBoundsKill', true);
            _this.firstBullets.setAll('checkWorldBounds', true);
            _this.secondBullets = game.add.group();
            _this.secondBullets.enableBody = true;
            _this.secondBullets.physicsBodyType = Phaser.Physics.ARCADE;
            _this.secondBullets.createMultiple(1, 'lightning', 0, false);
            _this.secondBullets.setAll('anchor.x', 0.5);
            _this.secondBullets.setAll('anchor.y', 0.5);
            _this.secondBullets.setAll('outOfBoundsKill', true);
            _this.secondBullets.setAll('checkWorldBounds', true);
            return _this;
        }
        Cloud.prototype.update = function (game) {
            if (this.hp <= 0) {
                return;
            }
            game.physics.arcade.overlap(this.firstBullets, this.target.getSprite(), this.target.bulletHit, null, this.target);
            this.sprite.tint = this.currentTint;
            this.fire(game);
        };
        Cloud.prototype.fire = function (game) {
            this.fireFirst(game);
            this.fireSecond(game);
            // if (this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
            //     this.resetFirstFireCoolDown(game);
            //
            //     let bullet = this.firstBullets.getFirstExists(false);
            //     bullet.___damage = game.rnd.realInRange(0, 10);
            //     bullet.reset(this.sprite.x + game.rnd.realInRange(0, this.sprite.width),
            //         this.sprite.y + game.rnd.realInRange(0,this.sprite.height));
            //
            //    game.physics.arcade.moveToObject(bullet, this.player.getSprite(), 500);
            // }
            //
            // if (this.canFire(game, this.secondFireCoolDown) && this.secondBullets.countDead() > 0) {
            //     this.resetSecondFireCoolDown(game);
            //
            //     this.secondBullets.setAll('rotation', game.physics.arcade.angleBetween(this.sprite, this.player.getSprite()));
            //
            //     let bullet = this.secondBullets.getFirstExists(false);
            //     bullet.___damage = game.rnd.realInRange(0, 50);
            //     bullet.reset(this.sprite.x + game.rnd.realInRange(0, this.sprite.width),
            //         this.sprite.y + game.rnd.realInRange(0, this.sprite.height));
            //
            //     game.physics.arcade.moveToObject(bullet, this.player.getSprite(), 1000);
            // }
        };
        Cloud.prototype.checkBulletHit = function (game, bullets) {
            game.physics.arcade.overlap(bullets, this.sprite, this.bulletHit, null, this);
        };
        Cloud.prototype.bulletHit = function (object, bullet) {
            console.log('cloud.bulletHit');
            bullet.kill();
            this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;
            var scale = this.hp / this.originalHp;
            scale = scale < .20 ? .20 : scale;
            console.log('scale: ' + scale);
            this.sprite.scale.setTo(scale, scale);
            var colorInverse = Math.round((1.0 - scale) * 255);
            console.log('colorInverse: ' + colorInverse);
            this.currentTint = Phaser.Color.toRGBA(colorInverse, colorInverse, colorInverse, 255);
            if (this.hp <= 0) {
                // this.sprite.kill();
                this.firstBullets.removeAll(true);
                this.secondBullets.removeAll(true);
                return true;
            }
            return false;
        };
        return Cloud;
    }(Character));
    var Sun = /** @class */ (function (_super) {
        __extends(Sun, _super);
        function Sun(sprite, game, i, player) {
            var _this = _super.call(this, "Cloud" + i, 200, sprite, game) || this;
            _this.sprite.body.collideWorldBounds = true;
            _this.currentTint = 0xffffff;
            _this.sprite.tint = _this.currentTint;
            // let explosions = game.add.group();
            //
            //     var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
            //     explosionAnimation.anchor.setTo(0.5, 0.5);
            //     explosionAnimation.animations.add('kaboom');
            _this.target = player;
            _this.firstBullets = game.add.group();
            _this.firstBullets.enableBody = true;
            _this.firstBullets.physicsBodyType = Phaser.Physics.ARCADE;
            _this.firstBullets.createMultiple(1, 'sunray');
            _this.firstBullets.setAll('anchor.x', 0.5);
            _this.firstBullets.setAll('anchor.y', 0.5);
            _this.firstBullets.setAll('outOfBoundsKill', true);
            _this.firstBullets.setAll('checkWorldBounds', true);
            _this.secondBullets = game.add.group();
            _this.secondBullets.enableBody = true;
            _this.secondBullets.physicsBodyType = Phaser.Physics.ARCADE;
            _this.secondBullets.createMultiple(1, 'heatwave', 0, false);
            _this.secondBullets.setAll('anchor.x', 0.5);
            _this.secondBullets.setAll('anchor.y', 0.5);
            _this.secondBullets.setAll('outOfBoundsKill', true);
            _this.secondBullets.setAll('checkWorldBounds', true);
            return _this;
        }
        Sun.prototype.update = function (game) {
            if (this.hp <= 0) {
                return;
            }
            game.physics.arcade.overlap(this.firstBullets, this.target.getSprite(), this.target.bulletHit, null, this.target);
            this.sprite.tint = this.currentTint;
            this.fire(game);
        };
        Sun.prototype.fire = function (game) {
            this.fireFirst(game);
            this.fireSecond(game);
        };
        Sun.prototype.checkBulletHit = function (game, bullets) {
            game.physics.arcade.overlap(bullets, this.sprite, this.bulletHit, null, this);
        };
        Sun.prototype.bulletHit = function (object, bullet) {
            console.log('sun.bulletHit');
            bullet.kill();
            this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;
            // let scale: number = this.hp / this.originalHp;
            // scale = scale < .20 ? .20 : scale;
            // this.sprite.scale.setTo(scale, scale);
            //
            // let colorInverse = Math.round((1.0 - scale) * 255);
            // this.currentTint = Phaser.Color.toRGBA(colorInverse, colorInverse, colorInverse, 255);
            if (this.hp <= 0) {
                // this.sprite.kill();
                this.firstBullets.removeAll(true);
                this.secondBullets.removeAll(true);
                return true;
            }
            return false;
        };
        return Sun;
    }(Character));
    var Building = /** @class */ (function () {
        function Building() {
        }
        return Building;
    }());
})(Weatherman = exports.Weatherman || (exports.Weatherman = {}));
//# sourceMappingURL=weatherman.js.map