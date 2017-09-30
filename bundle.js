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
            this.game.load.image('stormcloud', 'assets/stormcloud.png');
            this.game.load.image('lightning', 'assets/lightning.png');
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
            console.log(this.enemies);
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
            this.secondFireCoolDown = game.time.now + game.rnd.realInRange(0, 1000);
        };
        Character.prototype.canFire = function (game, fireCoolDown) {
            return game.time.now > fireCoolDown;
        };
        return Character;
    }());
    var Bullet = /** @class */ (function () {
        function Bullet() {
        }
        return Bullet;
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
            _this.firstBullets.createMultiple(10, 'bullet', 0, false);
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
            _this.player = player;
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
            game.physics.arcade.overlap(this.firstBullets, this.player.getSprite(), this.player.bulletHit, null, this.player);
            this.sprite.tint = 0xffffff;
            this.fire(game);
        };
        Cloud.prototype.fire = function (game) {
            if (this.canFire(game, this.firstFireCoolDown) && this.firstBullets.countDead() > 0) {
                this.resetFirstFireCoolDown(game);
                var bullet = this.firstBullets.getFirstExists(false);
                bullet.___damage = game.rnd.realInRange(0, 10);
                bullet.reset(this.sprite.x + game.rnd.realInRange(0, this.sprite.width), this.sprite.y + game.rnd.realInRange(0, this.sprite.height));
                bullet.rotation = game.physics.arcade.moveToObject(bullet, this.player.getSprite(), 250);
            }
            if (this.canFire(game, this.secondFireCoolDown) && this.secondBullets.countDead() > 0) {
                this.resetSecondFireCoolDown(game);
                var bullet = this.secondBullets.getFirstExists(false);
                bullet.___damage = game.rnd.realInRange(0, 50);
                bullet.reset(this.sprite.x + game.rnd.realInRange(0, this.sprite.width), this.sprite.y + game.rnd.realInRange(0, this.sprite.height));
                bullet.rotation = game.physics.arcade.moveToObject(bullet, this.player.getSprite(), 500);
            }
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
            this.sprite.scale.setTo(scale, scale);
            if (this.hp <= 0) {
                this.sprite.kill();
                this.firstBullets.removeAll(true);
                this.secondBullets.removeAll(true);
                return true;
            }
            return false;
        };
        return Cloud;
    }(Character));
})(Weatherman = exports.Weatherman || (exports.Weatherman = {}));


/***/ })
/******/ ]);