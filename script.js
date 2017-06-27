'use strict';

const Notifier   = require('node-notifier');
const nc         = new Notifier.NotificationCenter();
const Path       = require('path');
const Spooky     = require('spooky');
const Setting    = require('./src/js/setting')();
const execSync   = require('child_process').execSync;

const spooky = new Spooky({
		child: {
			transport: 'http'
		},
		casper: {
			logLevel: 'debug',
			verbose : true
		}
	},
	function (err) {

		if (err) {
			e = new Error('Failed to initialize SpookyJS');
			e.details = err;
			throw e;
		}

		spooky.create({
			pageSettings : Setting.desknets.pageSettings,
			viewportSize : Setting.window,
			clientScripts: [ __dirname + '/src/js/jquery.js' ]
		});
		spooky.userAgent(Setting.userAgent);
		spooky.start(Setting.desknets.url);

		spooky.then(function() {

			this.fill('#inputfrm', { UserID:Setting.desknets.login.UserID, _word:Setting.desknets.login._word }, true);

		});
		spooky.then(function() {

			this.emit('getDesknets');

		});

		spooky.run(function(){

			this.exit();

		});

	}
);

spooky.on('console', function (message) {

	console.log(message);

});

spooky.on('notify', function (message) {

	if (message.length <= 0) return;

	const icon = Path.join(__dirname, '/src/img/icon_desknets.gif');

	nc.notify(
		{
			title     : 'desknetsからのお知らせ',
			message   : message,
			closeLabel: '閉じる',
			actions   : '開く',
			icon      : icon,
			wait      : true,
			timeout　　: 60
		},
		function(err, response, metadata) {

			if (err) throw err;
			console.log(metadata);

			if (metadata.activationValue !== '開く') {
				return;
			}

			console.log('metadata');

			execSync('open ' + Setting.desknets.url);

		}
	);

});

spooky.on('getDesknets', function () {

	this.wait(1000,function() {

		var container = this.evaluate(function() {

			var _$header   = $('#dn-ntwi-container');
			var notifyList = getNotify();

			function getNotify() {

				var _$buttonList = _$header.find('.ntwi-notify-buttons');
				var _buttons = {
					news    : _$buttonList.find('a[data-type="news"]'),
					talk    : _$buttonList.find('a[data-type="talk"]'),
					message : _$buttonList.find('a[data-type="message"]')
				};

				var list = new Array();

				for ( key in _buttons ) {

					var $target = _buttons[key];
					var title   = $target.prop('title');
					var length  = $target.find('.ntwi-badge').text()|0;
					if (length > 0) list.push(title + ' : ' + length);

				}

				return list.join(' ');

			}

			return {
				notify : notifyList
			};

		});

		emit('notify',container.notify);

	});

});

spooky.on('getMail', function () {

	this.wait(3000,function() {

		this.emit('console','3');
		this.capture('d.png');
		var text = this.evaluate(function(){
			return document.location.href;
		});
		console.log(text);
		
	});


});


