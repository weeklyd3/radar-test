var player = {
	x: 0,
	y: 0,
	turnRate: 0,
	maxTurnRate: 1,
	heading: 0,
	velocity: [0, 0],
	map_range: 648 * 0.85,
	map_texture: '',
	display: 0,
	mass: 54000,
	temperature: 20,
	route: [],
	route_points: [],
	water_on_map: false,
	full_map: false,
	bullets: [],
	enemy_progress: {},
	enemy_counter: 0,
	// quests: lists all the quests given
	// the number indicates objectives completed
	// indicated using binary, first objective is last digit
	// second one complete but not first = 2
	// boolean indicates overall quest completion
	selected_quest: 0,
	selected_page: 0,
	quests: {"navigation": [0, false]},
	quest_list: ['navigation'],
	gun: {
		ammoLeft: 100,
		reloadPeriod: 96,
		reload: 0,
		speed: 10,
		speedRandom: 0,
		size: 10,
		lifetime: 200,
		color: 'green',
		damage: 1
	},
	engine: {
		display_warning: false,
		autopilot: false,
		parking_brake: true,
		autothrottle: false,
		idle_n1: 0.19,
		max_n1: 0.95,
		max_fuel: 15195,
		idle_ff: 1500,
		max_ff: 7500,
		current_n1: 0.19,
		trend_n1: 0,
		max_trend_n1: 0.005,
		max_trend_change_n1: 0.0003,
		current_n2: 1.002,
		current_ff: 2000,
		current_fuel: 12000,
		current_epr: 1.003,
		max_n2: 1.002,
		min_n2: 0,
		cmd_throttle: 0,
		cmd_n1: 0,
		cmd_epr: 0
	}
}
if (localStorage.getItem('RADARTEST-save')) {
	try {
		var saved = JSON.parse(localStorage.getItem('RADARTEST-save'));
		player = saved;
	} catch (e) {
		alert('INVALID SAVE! error: \n' + e.toString());
	}
}
var loaded_images = {};