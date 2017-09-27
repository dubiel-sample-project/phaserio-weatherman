/// <reference path="phaser.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Weatherman;
(function (Weatherman) {
    var Game = (function () {
        function Game() {
            // var cursors;
            // var stars;
            this.score = 0;
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create });
        }
        Game.prototype.preload = function () {
            this.game.load.image('sky', 'assets/sky.png');
            this.game.load.image('ground', 'assets/platform.png');
            this.game.load.image('star', 'assets/star.png');
            this.game.load.spritesheet('weatherman', 'assets/dude.png', 32, 48);
        };
        Game.prototype.create = function () {
        };
        return Game;
    }());
    Weatherman.Game = Game;
    var Character = (function () {
        function Character() {
        }
        return Character;
    }());
    var Bullet = (function () {
        function Bullet() {
        }
        return Bullet;
    }());
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player() {
            _super.apply(this, arguments);
        }
        return Player;
    }(Character));
    Weatherman.Player = Player;
    var Cloud = (function (_super) {
        __extends(Cloud, _super);
        function Cloud() {
            _super.apply(this, arguments);
        }
        return Cloud;
    }(Character));
    Weatherman.Cloud = Cloud;
})(Weatherman = exports.Weatherman || (exports.Weatherman = {}));
//# sourceMappingURL=weatherman.js.map