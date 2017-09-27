/// <reference path="phaser.d.ts" />

export module Weatherman {
    export class Game {

        game: Phaser.Game;
        player: Player;
        platforms: Phaser.Group;
        // var cursors;

        // var stars;
        score: number = 0;
        scoreText: string;

        constructor() {
            this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create });
        }

        preload() {
            this.game.load.image('sky', 'assets/sky.png');
            this.game.load.image('ground', 'assets/platform.png');
            this.game.load.image('star', 'assets/star.png');
            this.game.load.spritesheet('weatherman', 'assets/dude.png', 32, 48);
        }

        create() {

        }

    }

    abstract class Character {
        name: string;
        hp: number;


    }

    abstract class Bullet {
        x: number;
        y: number;
        speed: number;
    }

    export class Player extends Character {

    }

    export class Cloud extends Character {

    }
}
