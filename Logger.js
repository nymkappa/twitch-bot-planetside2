'use strict';

/**
 * Simple console.log wrapper
 */
class Logger {
	/**
     * Constructor
     */
	constructor() {
        this.enabled = true;
    }

    /**
     * uses varargs
     */
    log() {
        if (!this.enabled) {
            return;
        }
        console.log.apply(this, arguments);
    }
}

module.exports = Logger;
