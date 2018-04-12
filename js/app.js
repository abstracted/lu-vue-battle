class Player {
	constructor(name, hp, attack, special, heal, sMin, mMin, npcBool) {
		this.name = name;
		this.npc = npcBool;
		this.maxHP = hp;
		this.healthPoints = hp;
		this.attackMult = attack;
		this.specialMult = special;
		this.magicMult = heal;
		this.special = {
			canSpecial: false,
			counter: 0,
			minimum: sMin
		};
		this.magic = {
			canMagic: false,
			counter: 0,
			minimum: mMin
		};
	}
}

const vue = new Vue({
	el: '#app',
	data: {
		gameRunning: false,
		activePlayer: 0,
		otherPlayer: 1,
		winner: 'Nobody',
		sizes: [ 'small', 'large', 'large' ],
		players: [
			new Player('You', 10000, 900, 1600, 9000, 400, 375, false),
			new Player('Monster', 15000, 1000, 2000, 7000, 600, 550, true)
		],
		log: []
	},
	methods: {
		randomSize: function () {
			return this.sizes[ Math.ceil(Math.random() * this.sizes.length) ];
		},
		randomNumber: function (size) {
			let num = null;
			switch ( size ) {
				case 'small':
					num = 10;
					break;
				case 'medium':
					num = 100;
					break;
				case 'large':
					num = 1000;
					break;
				case 'jumbo':
					num = 3750;
					break;
				default:
					num = size;
			}
			return Math.ceil(Math.random() * num);
		},
		randomAdvanced: function (multiplier, bonus) {
			let processAmount = true;
			let amount = null;
			let initial = null;
			do {
				initial = this.randomNumber(multiplier);
				amount = initial + bonus;
				if ( amount > (multiplier - bonus) && amount < (multiplier + (bonus * 1.5)) ) {
					processAmount = false;
				}
			} while ( processAmount );
			return amount;
		},
		healthPercent: function (player) {
			return Math.ceil((player.healthPoints * 100) / player.maxHP);
		},
		statPercent: function (player, stat) {
			switch ( stat ) {
				case 'special':
					stat = player.special;
					break;
				case 'magic':
					stat = player.magic;
					break;
				default:
					window.alert('An invalid property for a status bar was defined in html.');
					break;
			}
			if ( stat.counter > stat.minimum ) {
				return 100;
			} else {
				return Math.ceil((stat.counter * 100) / stat.minimum);
			}
		},
		attack: function (special) {
			let player = this.players[ this.activePlayer ];
			let other = this.players[ this.otherPlayer ];
			let multiplier = null;
			let bonus = this.randomNumber('large');
			let specialMessage = '';
			if ( special ) {
				specialMessage = ' brutally';
				multiplier = player.specialMult;
				player.special.counter -= player.special.minimum;
			} else {
				multiplier = player.attackMult;
			}
			let attackAmount = this.randomAdvanced(multiplier, bonus);
			if ( (other.healthPoints - attackAmount) < 0 ) {
				other.healthPoints = 0;
			} else {
				other.healthPoints -= attackAmount;
			}
			let message = player.name + ' attacked ' + other.name + specialMessage + ' with ' + attackAmount + ' damage.';
			this.log.unshift([ this.activePlayer, message ]);
			if ( this.checkHealth() ) {
				this.nextRound();
			}
		},
		heal: function () {
			let player = this.players[ this.activePlayer ];
			let bonus = this.randomNumber('large');
			let healAmount = this.randomAdvanced(player.magicMult, bonus);
			if ( (healAmount + player.healthPoints) > player.maxHP ) {
				player.healthPoints = player.maxHP;
			} else {
				player.healthPoints += healAmount;
			}
			player.magic.counter -= player.magic.minimum;
			let message = player.name + ' healed +' + healAmount + ' HP. Health was restored to ' + player.healthPoints + '.';
			this.log.unshift([ this.activePlayer, message ]);
			this.nextRound();
		},
		ai: function () {
			let player = this.players[ this.activePlayer ];
			if ( this.healthPercent(player) < 50 && player.magic.canMagic === true ) {
				this.heal();
			} else {
				this.attack(player.special.canSpecial);
			}
		},
		checkHealth: function () {
			if ( this.players[ this.otherPlayer ].healthPoints <= 0 ) {
				this.winner = this.players[ this.activePlayer ].name;
				this.gameOver();
				return false;
			}
			return true;
		},
		gameOver: function () {
			this.gameRunning = false;
			if ( window.confirm(this.winner + ' won the game!\nWould you like to play again?') ) {
				this.startGame();
			}
		},
		nextRound: function () {
			if ( this.log.length > 2 ) {
				setTimeout(() => {
					this.log.pop();
				}, 2500);
			}
			this.updateAbilities();
			let temp = this.activePlayer;
			this.activePlayer = this.otherPlayer;
			this.otherPlayer = temp;
			if ( this.players[ this.activePlayer ].npc === true ) {
				this.ai();
			}
		},
		updateAbilities: function () {
			let player = this.players[ this.activePlayer ];
			player.magic.counter += this.randomNumber('medium');
			player.special.counter += this.randomNumber('medium');
			player.magic.canMagic = player.magic.counter >= player.magic.minimum;
			player.special.canSpecial = player.special.counter >= player.special.minimum;
		},
		startGame: function () {
			this.winner = 'Nobody';
			this.log = [];
			this.activePlayer = 0;
			this.otherPlayer = 1;
			this.gameRunning = true;
			for ( let player of this.players ) {
				player.special.counter = 0;
				player.special.canSpecial = false;
				player.magic.counter = 0;
				player.magic.canMagic = false;
				player.healthPoints = player.maxHP;
			}
		}
	}
});