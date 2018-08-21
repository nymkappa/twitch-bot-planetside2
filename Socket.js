"use strict"

/**
 * Requires
 */
var WebSocket = require('ws');

/**
 * Daybreak socket related function
 */
class Socket {
    /**
     * Constructor
     * @param {Logger} logger
     * @param {Events} events
     */
	constructor(logger, events, subscriptions) {
		this.logger = logger;
		this.events = events;
		this.subscriptions = subscriptions;
		this.socket = null;
		this.heartbeat = false;
	}

    /**
     * Send a message
     * @param {string} message 
     */
	sendMessage(message) {
		this.logger.log('Socket::sendMessage', message);
        this.dbSocket.send(JSON.stringify(message));
    }

	/**
     * Open the socket
     */
	openSocket() {
		this.logger.log('Socket::openSocket');
		this.dbSocket = new WebSocket('wss://push.planetside2.com/streaming' + '?environment=ps2&service-id=s:jorisvial');
		this.dbSocket.onclose = this.onClose.bind(this);
		this.dbSocket.onopen = this.onOpen.bind(this);
		this.dbSocket.onmessage = this.onMessage.bind(this);

		setInterval(this.checkHeartbeat.bind(this), 350000);
	}

    /**
     * Did we get a heartbeat in the last 5 minutes
     * if not, we need to re-open the websocket
     */
	checkHeartbeat() {
		this.logger.log('Socket::checkHeartbeat');
		if (this.heartBeat === false) {
			this.logger.log('Sockets::(Re)connecting to PS2 socket...');
			openSocket();
		} else {
			this.logger.log('Socket::Alive');
			this.heartBeat = false;
		}
	}

    /**
     * Received message from the socket
     * @param {json} event 
     */
	onMessage(event) {
		this.logger.log('Socket::onMessage', event.type, event.data);
		var obj = JSON.parse(event.data);

		// Heartbeat
		if (obj.type && obj.type === 'heartbeat') {
			this.heartBeat = true;
		} else if (obj.payload && obj.payload.event_name === 'Death') {
			// Payload
			this.events.playerDeath(obj.payload);
		}
	}

    /**
     * Socket is ready
     * @param {json} event 
     */
	onOpen(event) {
		this.logger.log('Socket::onOpen', 'PS2 WebSocket is ready');
		this.heartBeat = true;

		// Subscribe to some events
		this.subscriptions.playerDeathSub();
	}

    /**
     * Connection lost
     * @param {json} event 
     */
	onClose(event) {
		this.logger.log('Socket::onClose');
		this.logger.log('PS2 WebSocket has been closed');
	}
}

module.exports = Socket