"use strict";
// declare const apiKey: string;
Object.defineProperty(exports, "__esModule", { value: true });
var weatherman_1 = require("./weatherman");
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
//# sourceMappingURL=app.js.map