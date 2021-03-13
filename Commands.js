'use strict';

/**
 * Requires
 */
var request = require('request');

/**
 * Handle twitch chat commands
 */
class Commands {
	/**
     *
     * @param {Logger} logger
     * @param {Config} config
     * @param {Tmi} tmi clients
     */
	constructor(logger, config, tmi) {
		this.logger = logger;
		this.config = config;
		this.tmi = tmi;
	}

	say(message) {
		if (!message || !message.length) {
			return;
		}
		this.logger.log('commands::say', message);
		this.tmi.say(this.config.twitchChannel, message);
	}

	/**
	 * Wrong command
	 *
	 * @param {*} command
	 */
	unknown(command) {
		this.logger.log('[COMMANDS] !' + command + ' is not a command');
	}

	/**
     * Display basic character informations
     * !character [name_of_the_character]
	 *
	 * @param {*} target
	 * @param {*} context
	 * @param {*} param
	 */
	character(target, context, param) {
		// ----- Check the command
		if (!param[0]) {
			this.logger.log('[COMMANDS] !character requires a parameter');
			return this.say('[ex: !character Kappanion]');
		}
		this.logger.log('[COMMANDS] !character ' + param[0]);

		// ----- Make the daybreak api call
		var that = this;
		var url =
			'http://census.daybreakgames.com/s:jorisvial/get/ps2:v2' +
			'/character/?name.first_lower=' +
			param[0].toLowerCase() +
			'&c:join=title,characters_online_status,outfit_member_extended';

		var r = request(url, function(error, response, body) {
			// ----- Something went wrong
			if (error) {
				return that.custom_error('[COMMANDS][ERROR] !character returned ' + error);
			}

			// ----- Parse the response
			var obj = JSON.parse(body);
			if (!obj.character_list || obj.character_list.length <= 0) {
				return that.custom_error('Cannot parse daybreak response');
			}

			// ----- Format and send the response
			var response = that.format_character_list(obj.character_list, true);
			that.say(response);
		});
	}

	/**
     * Same as character() function but do it for
     * all characters defined in Config.js
     * !list
	 *
	 * @param {*} target
	 * @param {*} context
	 */
	list(target, context) {
		this.logger.log('[COMMANDS] !list');

		// ----- Generate character id list
		var list = '';
		for (var i = 0; i < this.config.ids.length; ++i) {
			list += this.config.ids[i];
			if (i + 1 < this.config.ids.length) {
				list += ',';
			}
		}

		// ----- Make the daybreak api call
		var that = this;
		var url =
			'http://census.daybreakgames.com/s:jorisvial/get/ps2:v2/character/?character_id=' +
			list +
			'&c:join=title,outfit_member_extended';

		var r = request(url, function(error, response, body) {
			// ----- Something went wrong
			if (error) {
				return that.custom_error('[COMMANDS][ERROR] !character returned ' + error);
			}

			// ----- Parse the response
			var obj = JSON.parse(body);
			if (!obj.character_list || obj.character_list.length <= 0) {
				return that.custom_error('Cannot parse daybreak response');
			}

			// ----- Format and send the response
			var response = that.format_character_list(obj.character_list, false);
			that.say(response);
		});
	}

	/**
     * Compute the total play time for all character
     * defined in Config.js
     * !playtime
	 *
	 * @param {*} target
	 * @param {*} context
	 */
	playtime(target, context) {
		this.logger.log('[COMMANDS] !playtime');

		// ----- Generate character id list
		var list = '';
		for (var i = 0; i < this.config.ids.length; ++i) {
			list += this.config.ids[i];
			if (i + 1 < this.config.ids.length) {
				list += ',';
			}
		}

		// ----- Make the daybreak api call
		var that = this;
		var url = 'http://census.daybreakgames.com/s:jorisvial/get/ps2:v2/character/?character_id=' + list;

		var r = request(url, function(error, response, body) {
			// ----- Something went wrong
			if (error) {
				return that.custom_error('[COMMANDS][ERROR] !playtime returned ' + error);
			}

			// ----- Parse the response
			var obj = JSON.parse(body);
			if (!obj.character_list || obj.character_list.length <= 0) {
				return that.custom_error('Cannot parse daybreak response');
			}

			var total = 0;
			for (var i = 0; i < obj.character_list.length; ++i) {
				var charInfo = obj.character_list[i];
				if (charInfo.times && charInfo.times.minutes_played) {
					total += (charInfo.times.minutes_played / 60.0);
				}
			}

			// ----- Format and send the response
			var response = that.config.streamerName + ' has a total playtime of ' + total.toFixed(0)
				+ ' hours (' + (total / 24).toFixed(0) + ' days!)';
			that.say(response);
		});
	}

	/**
	 * Special one for Braoin
	 * !current
	 *
	 * @param {*} target
	 * @param {*} context
	 */
	sexbot(target, context) {
		this.logger.log('[COOMMANDS] !sexbot');
		this.say("@Braoin, I'm waiting for you... KappaPride");
	}

    /**
	 * Look for the first currently logged in character
	 * !current
	 *
	 * @param {*} target
	 * @param {*} context
	 */
	current(target, context) {
		this.logger.log('[COMMANDS] !current');

		// ----- Generate character id list
		var list = '';
		for (var i = 0; i < this.config.ids.length; ++i) {
			list += this.config.ids[i];
			if (i + 1 < this.config.ids.length) {
				list += ',';
			}
		}

		// ----- Make the daybreak api call
		var that = this;
		var url = 'http://census.daybreakgames.com/s:jorisvial/get/ps2:v2/character/?character_id=' + list
			+ "&c:join=characters_online_status";

		var r = request(url, function(error, response, body) {
			// ----- Something went wrong
			if (error) {
				return that.custom_error('[COMMANDS][ERROR] !current returned ' + error);
			}

			// ----- Parse the response
			var obj = JSON.parse(body);
			if (!obj.character_list || obj.character_list.length <= 0) {
				return that.custom_error('Cannot parse daybreak response');
			}

			// ----- Look for the first online character
			for (var i = 0; i < obj.character_list.length; ++i) {
				var charInfo = obj.character_list[i];
				if (!charInfo.character_id_join_characters_online_status) {
					return that.custom_error("Daybreak online_status service is offline");
				}
				if (parseInt(charInfo.character_id_join_characters_online_status.online_status) !== 0) {
					if (charInfo.name && charInfo.name.first_lower) {
						return that.character(target, context, [charInfo.name.first_lower]);
					}
				}
			}

			that.custom_error("Didn't find any character online (yet)");
		});
	}


    /**
	 * Print currently played server
	 * !server
	 *
	 * @param {*} target
	 * @param {*} context
	 */
     server(target, context) {
		this.logger.log('[COMMANDS] !server');

		// ----- Generate character id list
		var list = '';
		for (var i = 0; i < this.config.ids.length; ++i) {
			list += this.config.ids[i];
			if (i + 1 < this.config.ids.length) {
				list += ',';
			}
		}

		// ----- Make the daybreak api call
		var that = this;
		var url = 'http://census.daybreakgames.com/s:jorisvial/get/ps2:v2/character/?character_id=' + list
			+ "&c:join=characters_online_status&c:resolve=world";

		var r = request(url, function(error, response, body) {
			// ----- Something went wrong
			if (error) {
				return that.custom_error('[COMMANDS][ERROR] !server returned ' + error);
			}

			// ----- Parse the response
			var obj = JSON.parse(body);
			if (!obj.character_list || obj.character_list.length <= 0) {
				return that.custom_error('Cannot parse daybreak response');
			}

			// ----- Look for the first online character
			for (var i = 0; i < obj.character_list.length; ++i) {
				var charInfo = obj.character_list[i];
				if (!charInfo.character_id_join_characters_online_status) {
					return that.custom_error("Daybreak online_status service is offline");
				}
				if (parseInt(charInfo.character_id_join_characters_online_status.online_status) !== 0) {
                    return that.world(charInfo.world_id);
				}
			}

			that.custom_error("Didn't find any character online (yet)");
		});
	}

    world(worldId) {
		// ----- Make the daybreak api call
		var that = this;
		var url =
			'https://census.daybreakgames.com/s:jorisvial/get/ps2:v2/world/?world_id=' +
			worldId
			;

		var r = request(url, function(error, response, body) {
			// ----- Something went wrong
			if (error) {
				return that.custom_error('[COMMANDS][ERROR] !server is unable to fetch the server name. ' + error);
			}

			// ----- Format and send the response
            var obj = JSON.parse(body);
			if (!obj.world_list || obj.world_list.length <= 0) {
				return that.custom_error('Cannot parse daybreak response');
			}
            that.say("Currently playing on " + obj.world_list[0].name.en);
		});
	}


	/**
	 * Bot call himself allowing user to see the command execute
	 */

	selfPlaytime(target, context) {
		this.say('!playtime');
	}
	selfCurrent(target, context) {
		this.say('!current');
	}

	/**
     * Format the character list response
	 *
     * @param {*} list
     * @param {bool} bFull - Display condensed or full play infos
     */
	format_character_list(list, bFull) {
        var response = '';

		for (var i = 0; i < list.length; ++i) {
            var line = "";

			var charInfo = list[i];

			if (!charInfo.name || !charInfo.times || !charInfo.battle_rank
				|| !charInfo.certs || !charInfo.prestige_level) {
				return this.custom_error('Cannot parse daybreak response');
			}

			var prestige = parseInt(charInfo.prestige_level);
			var name = charInfo.name.first;
			var hours = (charInfo.times.minutes_played / 60.0).toFixed(1);
			var rank = parseInt(charInfo.battle_rank.value) + prestige * 120;
			var certs = parseInt(charInfo.certs.earned_points) + parseInt(charInfo.certs.gifted_points);
			var next = charInfo.battle_rank.percent_to_next;

			if (bFull) {
                line = '[' + name + '] [BR' + rank + '] [Next:' + next + '%] [Certs:' + certs + '] [' + hours + 'h]';
			} else {
				line += '[' + charInfo.name.first + ' BR' + rank + ']';
            }

            if (i + 1 < list.length) {
                line += ' - ';
            }

            response += line;
		}

		return response;
	}

	/**
     * Print an error and send a "NotLikeThis" emote
     * @param {string} message
     */
	custom_error(message) {
		this.logger.log(message);
		return this.say('NotLikeThis ' + message);
	}
}

module.exports = Commands;
