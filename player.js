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
	route: [],
	route_points: [],
	water_on_map: false,
	full_map: false,
	bullets: [],
	gun: {
		ammoLeft: 100,
		reloadPeriod: 96,
		reload: 0,
		speed: 1,
		size: 10,
		lifetime: 200,
		color: 'green'
	},
	engine: {
		autopilot: false,
		parking_brake: true,
		autothrottle: false,
		idle_n1: 0.19,
		max_n1: 1.04,
		idle_ff: 1000,
		max_ff: 10000,
		current_n1: 0.19,
		trend_n1: 0,
		max_trend_n1: 0.005,
		max_trend_change_n1: 0.0003,
		current_n2: 1.002,
		current_ff: 1000,
		current_epr: 1.003,
		max_n2: 1.002,
		min_n2: 0,
		cmd_throttle: 0,
		cmd_n1: 0,
		cmd_epr: 0
	}
}
var loaded_images = {};