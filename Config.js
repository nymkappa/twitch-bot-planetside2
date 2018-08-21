'use strict';

/**
 * Hold the application configuration settings
 */
class Config {
    /**
     * Constructor
     */
    constructor() {
        // ---- Name to use in bot's messages
        this.streamerName = 'Ahorn';

        // ---- Your twich channel where the bot will connect
        this.twitchChannel = 'ahorn';
 
        // ---- Bot login credentials
        this.credentials = {
            identity: {
                // ---- Your bot twitch username
                username: 'ahornbot_',
                // ---- Your bot oauth token
                // Go to https://twitchapps.com/tmi/ to generate one
                password: 'oauth:' + 'qqq7wm84cvy8kra9hvwe3zl3wfvxqa',
            },
            channels: [
                'ahorn',
            ]
        }

        // ---- Wait for 'daybreakMessageDelay' milliseconds before
        // sending daybreak event related message in the chat
        // You want to tweak this according to your stream delay
        // so viewers don't get spoiled
        this.daybreakMessageDelay = 5000;
 
        // ---- Here you can add all you daybreak character ids
        // you want to track
        // If you want to know your ids, just look for them
        // at https://www.planetside2.com/players/
        // For example, "Kappanion" url is
        // https://www.planetside2.com/players/#!/8281042662261680273
        // so 8281042662261680273 is my daybreak character id
        this.ids = [
            // '5428624844701389185', //krappanion
            '5428010618038407873', //ahorn
            '5428204126946489361', //brokol
            '5428297992010586737', //ahorns
            '5428310317303118817', //brokolli
            '5428310317316022817', //schieberegler
            '5428597303256000433', //ahorny
            '8252468702021453201', //ahornvs
            '8274595775461494593', //bhorn
            '8275106603833878929', //asshorn
            '8282108246645013153', //mrhorns
        ]
    }
}

module.exports = Config