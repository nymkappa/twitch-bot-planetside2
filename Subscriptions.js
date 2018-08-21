'use strict';

/**
 * Handle all daybreak event subscriptions
 */
class Subscriptions {
	/**
     * 
     * @param {Logger} Logger 
     * @param {Socket} Socket 
     * @param {Config} Config 
     */
	constructor(logger, config) {
		this.logger = logger;
		this.socket = null;
		this.config = config;
	}

	/**
     * Death events subscription
     */
	playerDeathSub() {
		this.logger.log('Subscriptions::Subscribe to "Death" events');
		var msg = {
			service: 'event',
			action: 'subscribe',
			characters: this.config.ids,
			eventNames: [ 'Death' ]
		};
		this.socket.sendMessage(msg);
	}
}

module.exports = Subscriptions