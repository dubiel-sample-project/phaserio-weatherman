/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// declare const apiKey: string;
Object.defineProperty(exports, "__esModule", { value: true });
var weatherman_1 = __webpack_require__(1);
// class WeatherMan {
//
//     constructor() {
//         this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create });
//     }
//
//     game: Phaser.Game;
//
//     preload() {
//         this.game.load.image('logo', 'phaser.png');
//     }
//
//     create() {
//         var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
//         logo.anchor.setTo(0.5, 0.5);
//     }
//
// }
window.onload = function () {
    var game = new weatherman_1.Weatherman.Game();
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

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
        // score: number = 0;
        // scoreText: string;
        function Game() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
        }
        Game.rgb2hex = function (red, green, blue) {
            return blue | (green << 8) | (red << 16);
        };
        Game.prototype.preload = function () {
            this.game.load.image('sky', 'assets/sky.png');
            this.game.load.image('ground', 'assets/platform.png');
            this.game.load.image('star', 'assets/star.png');
            this.game.load.spritesheet('weatherman', 'assets/dude.png', 32, 48);
            this.game.load.image('bullet', 'assets/bullet.png');
            this.game.load.image('raindrop', 'assets/raindrop.png');
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
            this.scene = new CloudScene(this.player, this.game);
            this.player.getSprite().bringToTop();
            this.cursors = this.game.input.keyboard.createCursorKeys();
        };
        Game.prototype.update = function () {
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
            this.setCoolDownPauses(game);
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
        Character.prototype.fire = function (game) {
            this.fireFirst(game);
            this.fireSecond(game);
        };
        Character.prototype.isAlive = function () {
            return this.hp > 0;
        };
        Character.prototype.kill = function () {
            this.sprite.kill();
        };
        Character.prototype.canFire = function (game, fireCoolDown) {
            return game.time.now > fireCoolDown;
        };
        Character.prototype.fireFirst = function (game) {
            if (this.target && this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);
                this.firstBullets.setAll('rotation', game.physics.arcade.angleBetween(this.sprite, this.target.getSprite()));
                var bullet = this.firstBullets.getFirstExists(false);
                bullet.___damage = game.rnd.between(0, this.firstBulletsMaxDamage);
                bullet.reset(this.sprite.x + game.rnd.between(0, this.sprite.width), this.sprite.y + game.rnd.between(0, this.sprite.height));
                game.physics.arcade.moveToObject(bullet, this.target.getSprite(), this.firstBulletsSpeed);
            }
        };
        Character.prototype.fireSecond = function (game) {
            if (this.target && this.canFire(game, this.secondFireCoolDown) && this.secondBullets.countDead() > 0) {
                this.resetSecondFireCoolDown(game);
                this.secondBullets.setAll('rotation', game.physics.arcade.angleBetween(this.sprite, this.target.getSprite()));
                var bullet = this.secondBullets.getFirstExists(false);
                bullet.___damage = game.rnd.between(0, this.secondBulletsMaxDamage);
                bullet.reset(this.sprite.x + game.rnd.between(0, this.sprite.width), this.sprite.y + game.rnd.between(0, this.sprite.height));
                game.physics.arcade.moveToObject(bullet, this.target.getSprite(), this.secondBulletsSpeed);
            }
        };
        Character.prototype.resetFirstFireCoolDown = function (game) {
            this.firstFireCoolDown = game.time.now + this.firstFireCoolDownPause;
        };
        Character.prototype.resetSecondFireCoolDown = function (game) {
            this.secondFireCoolDown = game.time.now + this.secondFireCoolDownPause;
        };
        return Character;
    }());
    var Scene = /** @class */ (function () {
        function Scene(player, game) {
            this.player = player;
            this.enemies = [];
            this.buildings = [];
        }
        Scene.prototype.update = function (game) {
            for (var _i = 0, _a = this.enemies; _i < _a.length; _i++) {
                var enemy = _a[_i];
                enemy.update(game);
                enemy.checkBulletHit(game, this.player.getFirstBullets());
                enemy.checkBulletHit(game, this.player.getSecondBullets());
                if (!enemy.isAlive()) {
                    enemy.kill();
                    enemy = null;
                }
            }
            for (var _b = 0, _c = this.buildings; _b < _c.length; _b++) {
                var building = _c[_b];
                building.update(game);
            }
        };
        return Scene;
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
            _this.firstBulletsMaxDamage = game.rnd.between(20, 50);
            // this.secondBulletsMaxDamage = game.rnd.between(50, 100);
            _this.firstBulletsSpeed = 400;
            // this.secondBulletsSpeed = 1000;
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
        Player.prototype.setCoolDownPauses = function (game) {
            this.firstFireCoolDownPause = game.rnd.between(100, 200);
            // this.secondFireCoolDownPause = game.rnd.between(600, 1000);
        };
        Player.prototype.update = function (game) {
        };
        Player.prototype.fire = function (game) {
            console.log('player.fire');
            if (this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);
                var bullet = this.firstBullets.getFirstExists(false);
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
        function Cloud(sprite, game, i, player, buildings) {
            var _this = _super.call(this, "Cloud" + i, 200, sprite, game) || this;
            _this.sprite.body.collideWorldBounds = true;
            // this.currentTint = Phaser.Color.toABGR(255, 96, 96, 96);
            _this.currentTint = Game.rgb2hex(96, 96, 96);
            _this.sprite.tint = _this.currentTint;
            _this.firstBulletsMaxDamage = game.rnd.between(5, 10);
            _this.secondBulletsMaxDamage = game.rnd.between(50, 100);
            _this.firstBulletsSpeed = 400;
            _this.secondBulletsSpeed = 600;
            // let explosions = game.add.group();
            //
            //     var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
            //     explosionAnimation.anchor.setTo(0.5, 0.5);
            //     explosionAnimation.animations.add('kaboom');
            _this.player = player;
            _this.target = player;
            _this.buildings = buildings;
            _this.firstBullets = game.add.group();
            _this.firstBullets.enableBody = true;
            _this.firstBullets.physicsBodyType = Phaser.Physics.ARCADE;
            _this.firstBullets.createMultiple(1, 'raindrop');
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
        Cloud.prototype.setCoolDownPauses = function (game) {
            this.firstFireCoolDownPause = game.rnd.between(300, 600);
            this.secondFireCoolDownPause = game.rnd.between(3000, 5000);
        };
        Cloud.prototype.update = function (game) {
            if (!this.isAlive()) {
                return;
            }
            this.target = this.player;
            if ((game.rnd.between(1, 5) % 2) != 0) {
                var length_1 = this.buildings.length;
                var index = game.rnd.between(0, length_1 - 1);
                this.target = this.buildings[index];
            }
            game.physics.arcade.overlap(this.firstBullets, this.target.getSprite(), this.target.bulletHit, null, this.target);
            this.sprite.tint = this.currentTint;
            this.fire(game);
        };
        Cloud.prototype.checkBulletHit = function (game, bullets) {
            game.physics.arcade.overlap(bullets, this.sprite, this.bulletHit, null, this);
        };
        Cloud.prototype.bulletHit = function (object, bullet) {
            // console.log('cloud.bulletHit');
            // console.log(typeof bullet);
            bullet.kill();
            this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;
            var scale = this.hp / this.originalHp;
            scale = scale < .25 ? .25 : scale;
            this.sprite.scale.setTo(scale, scale);
            var newTint = Math.round((1.0 - scale) * (255 - 96) + 96);
            this.currentTint = Game.rgb2hex(newTint, newTint, newTint);
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
            var _this = _super.call(this, "Sun" + i, 500, sprite, game) || this;
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
        Sun.prototype.setCoolDownPauses = function (game) {
            this.firstFireCoolDownPause = game.rnd.between(200, 500);
            this.secondFireCoolDownPause = game.rnd.between(600, 1000);
        };
        Sun.prototype.update = function (game) {
            if (this.hp <= 0) {
                return;
            }
            game.physics.arcade.overlap(this.firstBullets, this.target.getSprite(), this.target.bulletHit, null, this.target);
            this.sprite.tint = this.currentTint;
            this.fire(game);
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
        function Building(id, game) {
            this.id = id;
            this.hp = 100;
            // game.load.atlas('building' + this.id, 'assets/building' + this.id + '.png',
            //     'assets/building' + this.id + '.json'),
            // this.sprite = game.add.sprite(0, 0, 'building' + id, 'building' + id + '.png');
            this.sprite = game.add.sprite(0, 0, 'building2', 'building2_1.png');
            this.sprite.x = 50;
            this.sprite.y = game.world.height - 64 - this.sprite.height;
            this.sprite.tint = 0xffffff;
            game.physics.arcade.enable(this.sprite);
        }
        Building.prototype.getSprite = function () {
            return this.sprite;
        };
        Building.prototype.update = function (game) {
            // this.sprite.tint = 0xffffff;
        };
        Building.prototype.bulletHit = function (object, bullet) {
            console.log('building.bulletHit');
            bullet.kill();
            // this.sprite.tint = 0xa00000;
            this.hp -= bullet.___damage;
            switch (true) {
                case this.hp < 10:
                    this.sprite.frameName = 'building2_5.png';
                    break;
                case this.hp < 30:
                    this.sprite.frameName = 'building2_4.png';
                    break;
                case this.hp < 60:
                    this.sprite.frameName = 'building2_3.png';
                    break;
                case this.hp < 90:
                    this.sprite.frameName = 'building2_2.png';
                    break;
            }
            if (this.hp <= 0) {
                // this.sprite.kill();
                return true;
            }
            return false;
        };
        return Building;
    }());
    var CloudScene = /** @class */ (function (_super) {
        __extends(CloudScene, _super);
        function CloudScene(player, game) {
            var _this = _super.call(this, player, game) || this;
            _this.enemiesTotal = 4;
            _this.buildings.push(new Building('2', game));
            for (var i = 0; i < _this.enemiesTotal; i++) {
                _this.enemies.push(new Cloud(game.add.sprite(200 * i + game.rnd.between(0, 20), game.rnd.between(0, 20), 'stormcloud'), game, i, player, _this.buildings));
            }
            return _this;
        }
        return CloudScene;
    }(Scene));
    var SunScene = /** @class */ (function (_super) {
        __extends(SunScene, _super);
        function SunScene(player, game) {
            var _this = _super.call(this, player, game) || this;
            _this.enemiesTotal = 1;
            for (var i = 0; i < _this.enemiesTotal; i++) {
                _this.enemies.push(new Sun(game.add.sprite(0, -300, 'sun'), game, i, player));
            }
            return _this;
        }
        return SunScene;
    }(Scene));
})(Weatherman = exports.Weatherman || (exports.Weatherman = {}));


/***/ })
/******/ ]);