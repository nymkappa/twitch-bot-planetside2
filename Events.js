'use strict';

/**
 * Requires
 */
var request = require('request');

/**
 * Handle events from daybreak
 */
class Events {
    /**
     * Constructor
     * @param {Logger} logger
     * @param {Config} config
     * @param {Tmi.client} config
     */
    constructor(logger, config, client) {
        this.logger = logger;
        this.config = config;
        this.killStreak = 0;
        this.client = client;
    }

    /**
     * Wait before sending a message
     *
     * @param {string} message
     */
    delayedMessage(message) {
        if (!message || !message.length) {
            this.logger.log('delayedMessage is empty');
            return;
        }
        this.logger.log('delayedMessage', message);
        setTimeout(this.client.say.bind(this.client, this.config.credentials.channels[0], message),
            this.config.daybreakMessageDelay);
    }

    /**
     * Player died or killed someone
     * @param {*} event
     */
    playerDeath(event) {
        if (!event) {
            return;
        }

        this.logger.log('playerDeath event', event)

        // ---- Get killer/killed
        var loadout = event.attacker_loadout_id;
        var killer = event.attacker_character_id;
        var dead = false;

        if (this.config.ids.indexOf(killer) >= 0) {
            // ---- If the killer is in our ids, then it's a kill!
            this.killStreak++;
            this.logger.log('Kill, killstreak: ' + this.killStreak);
        } else {
            // ---- Otherwise, we are dead
            dead = true;
            this.killStreak = 0;
            this.logger.log('Killed');
        }

        // --- Infiltrator kill
        if (dead && (loadout == 1 || loadout == 8 || loadout == 15)) {
            this.delayedMessage('!infils +');
        }

        // --- Kill streak step
        if (this.killStreak == 5) {
            this.delayedMessage('5 Kills in a row! PogChamp');
        }
        else if (this.killStreak == 10) {
            this.delayedMessage('10 Kills in a row! Kreygasm');
        }
        else if (this.killStreak == 15) {
            this.delayedMessage('15 Kills in a row! DBstyle');
        }
        else if (this.killStreak == 20) {
            this.delayedMessage('20 Kills in a row! DarkMode GivePLZ UnSane DatSheffy');
        }
        else if (this.killStreak == 25) {
            this.delayedMessage('25 Kills in a row... Not counting anymore FailFish');
        }
    }
}

module.exports = Events;