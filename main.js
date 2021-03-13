'use strict';

/**
 * Requires
 */
var Socket = require('./Socket.js');
var Logger = require('./Logger.js');
var Events = require('./Events.js');
var Subscriptions = require('./Subscriptions.js');
var Commands = require('./Commands.js');
var Config = require('./Config.js');
var Tmi = require('tmi.js');

// Create instances
var logger = new Logger();
var config = new Config();
var client = new Tmi.client(config.credentials);
var events = new Events(logger, config);
var subscriptions = new Subscriptions(logger, config);
var commands = new Commands(logger, config, client);
var socket = new Socket(logger, events, subscriptions);
subscriptions.socket = socket;
events.client = client;

// ---- Open daybreak socket
socket.openSocket();

// Connect to twitch
client.connect();

// Register twitch callbacks
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);

// Save chat target/context
var lastTarget = null;
var lastContext = null;

var test = false;
/**
 * Called every time a message comes in
 */
function onMessageHandler(target, context, msg, self) {
	// We allow bot to send himself commands
	if (self && msg.substr(0, 1) !== '!') {
		return;
	}

    // ---- Check if it's a command
	if (msg.substr(0, 1) !== '!') {
		return;
	}

    // ---- Parse the command
	const parse = msg.slice(1).split(' ');
	const command = parse[0];
	const params = parse.slice(1);

	// Save target and context
	lastTarget = target;
	lastContext = context;

	// ---- Commands
	if (command === 'character') {
		commands.character(target, context, params);
	} else if (command === 'list') {
        commands.list(target, context);
    } else if (command === 'playtime') {
        commands.playtime(target, context);
    } else if (command === 'current') {
        commands.current(target, context);
	} else if (command === 'sexbot') {
        commands.sexbot(target, context);
	} else if (command === 'server') {
       commands.server(target, context);
	} else {
        commands.unknown(command);
    }
}

/**
 * Called every time the bot connects to Twitch chat
 *
 * @param {*} addr
 * @param {*} port
 */
function onConnectedHandler(addr, port) {
	console.log(`[TMI] Connected to ${addr}:${port}`);
}

/**
 * Called every time the bot disconnects from Twitch
 *
 * @param {*} reason
 */
function onDisconnectedHandler(reason) {
	console.log(`[TMI] Womp womp, disconnected: ${reason}`);
	process.exit(1);
}

// ---- Run some command automatically from time to time
setInterval(commands.selfPlaytime.bind(commands, lastTarget, lastContext), 3600000);
setInterval(commands.selfCurrent.bind(commands, lastTarget, lastContext), 1800000);
