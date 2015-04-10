/**
 * A module which defines the player object
 * @module app/player
 */
define(["app/config"], function(config){
   "use strict"

    var Player = function() {}
    Player.prototype.init = function(game, x, y){
        var x = x || 0;
        var y = y || 0;

        this.game = game;
        this.sprite = this.game.add.sprite(x, y, "player-ship");
        this.sprite.scale.set(0.3, 0.3);
        this.sprite.anchor.set(0.5, 0.5);
        this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
        this.sprite.body.collideWorldBounds = true;
        this.speed = config.player.defaultSpeed;

        this.createPowerupRing();

        this.group = game.add.group();
        this.group.enableBody = true;
        this.group.physicsBodyType = Phaser.Physics.ARCADE;

        for (var i=0; i < 20; ++i) {
            var bullet = this.group.create(-100, -100, 'player-basic-bullet');
            bullet.checkWorldBounds = true;
            bullet.exists = false;
            bullet.visible = false;
            bullet.events.onOutOfBounds.add(this.killBullet, this);

            // base bullet damage
            bullet.attack = 5;
        }

        this.powerups = [];
        this.waiting = null;
    }

    Player.prototype.createPowerupRing = function() {
        var bmd = this.game.add.bitmapData(200, 200);
        bmd.context.beginPath();

        bmd.context.arc(100, 100, 75, -Math.PI*1/6, Math.PI*1/6, false);
        bmd.context.lineWidth = 2;
        bmd.context.strokeStyle = '#003300';
        bmd.context.stroke();

        bmd.context.beginPath();
        bmd.context.arc(100, 100, 75, Math.PI-Math.PI*1/6, Math.PI+Math.PI*1/6, false);
        bmd.context.lineWidth = 2;
        bmd.context.strokeStyle = '#003300';
        bmd.context.stroke();

        this.powerupRing = this.game.add.sprite(0, 0, bmd);
        this.powerupRing.anchor.set(0.5, 0.5)
        this.powerupRing.alpha = 0.3;

        // Don't add child because of scale
        this.powerupRing.update = function(){
            this.powerupRing.position = this.sprite.position;
        }.bind(this);
    }

    Player.prototype.killBullet = function(bullet) {
        bullet.kill();
    }

    Player.prototype.makingSelection = function() {
        this.powerupRing.alpha = 0.6;
        this.waiting.displaysprite.alpha = 0.9;
        this.powerups.forEach(function(powerup){
            powerup.displaysprite.alpha = 0.9;
        });
    }

    Player.prototype.finishedSelection = function() {
        this.powerupRing.alpha = 0.3;
        this.waiting.displaysprite.alpha = 0.4;
        this.powerups.forEach(function(powerup){
            powerup.displaysprite.alpha = 0.4;
        });
    }

    Player.prototype.pickup = function(powerup) {
        this.waiting = powerup;
        var newsprite = this.waiting.createSprite();
        newsprite.offset = {x: 0, y:0};
        newsprite.update = function() {
            newsprite.position.x =
                this.sprite.position.x + newsprite.offset.x;
            newsprite.position.y =
                this.sprite.position.y + newsprite.offset.y;
        }.bind(this)
        this.updatePowerupImages();
    }

    Player.prototype.updatePowerupImages = function() {
        var setPowerupPosition = function(i, x, y) {
            if (this.powerups[i] && this.powerups[i].displaysprite) {
                this.powerups[i].displaysprite.offset.x = x;
                this.powerups[i].displaysprite.offset.y = y;
            }
        }.bind(this);
        setPowerupPosition(0, -60, -20);
        setPowerupPosition(1, -60, 20);
        setPowerupPosition(2, 60, -20);
        setPowerupPosition(3, 60, 20);

        if (this.waiting) {
            this.waiting.displaysprite.offset.x = 0;
            this.waiting.displaysprite.offset.y = 60;
        }
    }

    Player.prototype.attack = function() {
        var bullet = this.group.getFirstExists(false);
        if (!bullet)
            return;
        bullet.reset(this.position.x, this.position.y-30);
        bullet.body.velocity.y = -500;

        this.powerups.map(function(powerup){
            if (powerup.attack) {
                powerup.attack(this);
            }
        }, this);
    }

    Object.defineProperty(Player.prototype, "position", {
        get : function() {
            return this.sprite.position;
        }
    });

    Object.defineProperty(Player.prototype, "velocity", {
        get : function() {
            return this.sprite.body.velocity;
        },
        set : function(value) {
            this.sprite.body.velocity = value;
        }
    });

    var player = new Player();

    return player;
});
