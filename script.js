function drawMap(draw, width, height) {
	if (globalDraw.keyIsDown(173) || globalDraw.keyIsDown(61)) {
		var currentRatio = player.map_range / (height * 0.85);
		if (globalDraw.keyIsDown(173)) currentRatio += 0.1;
		else currentRatio -= 0.1;
		currentRatio = Math.round(10 * currentRatio) / 10;
		if (currentRatio < 0.5) currentRatio = 0.5;
		if (currentRatio > 10) currentRatio = 10;
		player.map_range = height * 0.85 * currentRatio;
	}
	display2_header.clear();
	display2_header.fill('black');
	display2_header.rect(0, 0, width, height);
	display2_header.erase();
	display2_header.circle(width / 2, height * 0.95, height * 1.7);
	display2_header.noErase();
	draw.clear();
	draw.push();
	draw.background('black');
	var map_center = [width / 2, height * 0.95];
	var map_heading = player.heading;
	var map_radius = height * 0.85;
	draw.translate(...map_center);
	draw.rotate(-map_heading);
	draw.fill(draw.color(0, 0, 0, 0));
	draw.stroke('white');
	draw.rotate(player.heading);
	drawWaypoints(draw, width, height);
	draw.fill(draw.color(0, 0, 0, 0));
	draw.strokeWeight(1);
	draw.triangle(-10, 14, 10, 14, 0, -14);
	draw.strokeWeight(0);
	draw.image(display2_header, -width / 2, -height * 0.95, width, height);
	draw.rotate(-player.heading);
	draw.stroke('white');
	draw.fill('white');
	draw.strokeWeight(0);
	for (var i = 0; i < 36; i++) {
		draw.text(i, 0, -map_radius - height * 0.01);
		draw.rotate(10);
	}
	for (var i = 0; i < 36; i++) {
		draw.strokeWeight(1);
		draw.line(0, -map_radius, 0, -map_radius + height * 0.05);
		draw.rotate(5);
		draw.line(0, -map_radius, 0, -map_radius + height * 0.03);
		draw.rotate(5);
	}
	draw.fill(draw.color(0, 0, 0, 0));
	draw.stroke('white');
	draw.circle(0, 0, map_radius * 2);
	draw.push();
	draw.fill('white');
	draw.strokeWeight(0);
	draw.textAlign('right', 'center');
	draw.text('map zoom ×' + Math.round(10 * player.map_range / map_radius) / 10 + "\nrange " + Math.round(player.map_range) + " px", width / 2, -height * 0.85);
	draw.pop();
	draw.pop();
}
function drawEngine(draw, width, height) {
	draw.clear();
	draw.push();
	draw.strokeWeight(0);
	draw.background('black');
	draw.fill('white');
	var parameters = [
		{
			name: 'Throttle',
			min: 0,
			max: 100,
			value: (player.engine.current_n1 - player.engine.idle_n1) / (player.engine.max_n1 - player.engine.idle_n1) * 100,
			decimals: 1,
			dial: true,
			commanded_value: player.engine.cmd_throttle * 100
		},
		{
			name: "Commanded Throttle",
			min: 0,
			max: 100,
			value: player.engine.cmd_throttle * 100,
			dial: false,
			decimals: 1,
			hide: player.display != 2
		},
		{
			name: 'EPR',
			min: 0.9,
			max: 1.9,
			value: player.engine.current_epr,
			decimals: 3,
			dial: true,
			commanded_value: player.engine.cmd_epr
		},
		{
			name: 'Commanded EPR',
			min: 0.9,
			max: 1.9,
			value: player.engine.cmd_epr,
			decimals: 3,
			dial: false,
			hide: player.display != 2
		},
		{
			name: 'N1',
			min: 0,
			max: 104,
			value: player.engine.current_n1 * 100,
			decimals: 1,
			dial: player.display == 2,
			commanded_value: player.engine.cmd_n1
		},
		{
			name: 'Commanded N1',
			min: 0,
			max: 104,
			value: player.engine.cmd_n1 * 100,
			decimals: 1,
			dial: false,
			hide: player.display != 2
		},
		{
			name: 'N2',
			min: 0,
			max: 100.2,
			value: player.engine.current_n2 * 100,
			decimals: 1,
			dial: player.display == 2
		},
		{
			name: "Fuel per hour",
			min: 0,
			max: Infinity,
			value: player.engine.current_ff,
			decimals: 0,
			dial: false
		}
	];
	draw.translate(width / 2, 10);
	for (const param of parameters) {
		if (param.hide) continue;
		draw.translate(0, param.dial ? 35 : 10);
		drawParameter(draw, param);
		draw.translate(0, param.dial ? 35 : 10);
	}
	draw.pop();
}
function drawParameter(draw, param) {
	draw.textAlign('right', 'center');
	draw.text(param.name, -30, 0);
	draw.rect(-7, -1, 14, 2);
	var param_value = param.value;
	if (param_value < param.min) param_value = param.min;
	if (param_value > param.max) param_value = param.max;
	var value = param_value.toFixed(param.decimals);
	if (param.dial) {
		draw.push();
		draw.fill(draw.color(0, 0, 0, 0));
		draw.strokeWeight(1);
		draw.arc(60, 0, 60, 60, 150, 30);
		draw.translate(60, 0);
		draw.fill('lime');
		draw.strokeWeight(0);
		draw.circle(0, 0, 5);
		draw.rotate(240);
		var rotate_amount = (param_value - param.min) / (param.max - param.min) * 240;
		draw.rotate(rotate_amount);
		draw.rect(-1, -30, 2, 30)
		draw.rotate(-rotate_amount);
		draw.fill('white');
		for (var i = 0; i < 11; i++) {
			draw.rect(-0.5, -35, 1, 5);
			draw.rotate(24);
		}
		draw.rotate(-264);
		if (param.hasOwnProperty('commanded_value')) {
			var cmd_value = param.commanded_value;
			var cmd_rotate_amount = (cmd_value - param.min) / (param.max - param.min) * 240;
			draw.fill('cyan');
			draw.rotate(cmd_rotate_amount);
			draw.triangle(0, -33, -3, -41, 3, -41);
		}
		draw.pop();
		draw.fill('lime');
		draw.textAlign('center', 'center');
		draw.text(value, 60, 20);
		draw.fill('white');
	} else {
		draw.textAlign('left', 'center');
		draw.text(value, 30, 0);
	}
}
function loadZone(name) {
	waypoints[name] = [];
	var numbers = name.split(',');
	var x = Number(numbers[0]);
	var y = Number(numbers[1]);
	if (x < -10 || x > 10) return;
	if (y < -10 || y > 10) return;
	if (localStorage.getItem('points-' + name)) {
		waypoints[name] = JSON.parse(localStorage.getItem('points-' + name));
		return;
	}
	fetch('points/' + name + '.json').then((s) => s.json())
	.then((s) => {
		waypoints[name] = s;
		localStorage.setItem('points-' + name, JSON.stringify(s));
	});
}
function drawWaypoints(draw, width, height) {
	var ratio = height * 0.85 / player.map_range;
	draw.fill('lime');
	draw.strokeWeight(0);
	var position = [player.x, player.y];
	var range = player.map_range;
	var offset = Math.ceil(range / 500);
	var min_range = [player.zoneX - offset, player.zoneY - offset];
	var max_range = [player.zoneX + offset, player.zoneY + offset];
	for (var x = min_range[0]; x <= max_range[0]; x++) {
		for (var y = min_range[1]; y <= max_range[1]; y++) {
			if (player.map_texture) {
				if (!textures[player.map_texture]) textures[player.map_texture] = {};
				var texture_object = textures[player.map_texture];
				if (!texture_object[`${x},${y}`]) {
					var url = `textures/${player.map_texture}/${x},${y}.png`;
					texture_object[`${x},${y}`] = globalDraw.loadImage(url);
				}
				target = texture_object[`${x},${y}`];
				if (target) draw.image(texture_object[`${x},${y}`], ((x - player.zoneX) * 500 - player.zoneXOffset) * ratio, ((y - player.zoneY) * 500 - player.zoneYOffset) * ratio, 500 * ratio, 500 * ratio);
			}
			if (!waypoints[x + ',' + y]) {
				loadZone(x + ',' + y);
			} else {
				for (const wpt of waypoints[x + ',' + y]) {
					var distance = ((player.x - wpt.x) ** 2 + (player.y - wpt.y) ** 2) ** 0.5;
					if (distance > player.map_range) continue;
					var angle = Math.atan2(player.y - wpt.y, wpt.x - player.x) * 180 / Math.PI;
					angle = player.heading + angle;
					var angle_rad = angle * Math.PI / 180;
					var dx = distance * Math.cos(angle_rad);
					var dy = -distance * Math.sin(angle_rad);
					dx *= ratio;
					dy *= ratio;
					draw.circle(dx, dy, 3);
					draw.text(wpt.name.toUpperCase(), dx, dy + 10);
				}
			}
		}
	}
}
function drawDisplay(draw, width, height) {
	if (!player.display && (nav_display.height >= (globalDraw.height * 0.6))) {
		nav_display.resizeCanvas(width, globalDraw.height * 0.6);
		display2_header.resizeCanvas(width, globalDraw.height * 0.6);
	}
	if (!player.display && (engine_display.height >= globalDraw.height * 0.4)) {
		engine_display.resizeCanvas(width, globalDraw.height * 0.4);
	}
	if (player.display == 1 && (nav_display.height < globalDraw.height)) {
		console.log('resizing to full');
		nav_display.resizeCanvas(width, globalDraw.height);
		display2_header.resizeCanvas(width, globalDraw.height);
	}
	if (player.display == 2 && (engine_display.height < globalDraw.height)) {
		engine_display.resizeCanvas(width, globalDraw.height);
	}
	if (player.display < 2) {
		drawMap(nav_display, width, nav_display.height);
		draw.image(nav_display, 0, 0);
	}
	if (player.display == 2 || player.display == 0) {
		drawEngine(engine_display, width, engine_display.height);
		if (!player.display) draw.image(engine_display, 0, height * 0.6);
		else draw.image(engine_display, 0, 0);
	}
}
function update() {
	player.engine.current_epr = 0.983 + 0.02 * Math.min(1, player.engine.current_n1 / 0.19) + 0.83 * Math.max(0, (player.engine.current_n1 - 0.19) / 0.85);
	player.engine.cmd_n1 = player.engine.idle_n1 + player.engine.cmd_throttle * (player.engine.max_n1 - player.engine.idle_n1);
	player.engine.cmd_epr = 1.003 + 0.83 * player.engine.cmd_throttle;
	player.zoneX = Math.floor(player.x / 500);
	player.zoneY = Math.floor(player.y / 500);
	player.zoneXOffset = player.x - 500 * player.zoneX;
	player.zoneYOffset = player.y - 500 * player.zoneY;
	draw.clear();
	drawDisplay(display2, width / 2, height);
	draw.image(display1, 0, 0);
	draw.image(display2, width / 2, 0);
}
function keydown(ev) {
	if (ev.keyCode == 86) {
		player.display += 1;
		if (player.display > 2) player.display = 0;
	}
}
addEventListener('keydown', keydown);
var player = {
	x: 0,
	y: 0,
	heading: 0,
	map_range: 648 * 0.85,
	map_texture: '',
	display: 0,
	engine: {
		idle_n1: 0.19,
		max_n1: 1.04,
		idle_ff: 1000,
		max_ff: 10000,
		current_n1: 0.19,
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
var waypoints = {};
var textures = {};
var waypointsToLoad = [];
var width = 960;
var height = 540;
var s = function (sketch) {
	sketch.setup = async function () {
		sketch.createCanvas(width, height);
		draw.angleMode(draw.DEGREES);
		updateInterval = setInterval(update, 1000 / 24);
		display1 = draw.createGraphics(width / 2, height);
		display2 = draw.createGraphics(width / 2, height);
		display2.textFont('consolas');
		display2.angleMode('degrees');
		display2.background('black');
		display2.textAlign('center', 'center');
		nav_display = draw.createGraphics(width / 2, height);
		nav_display.textFont('consolas');
		nav_display.angleMode('degrees');
		nav_display.textAlign('center', 'center');
		engine_display = draw.createGraphics(width / 2, height);
		engine_display.textFont('consolas');
		engine_display.angleMode('degrees');
		engine_display.stroke('white');
		engine_display.textAlign('center', 'center');
		engine_display.textSize(15);
		display2_header = draw.createGraphics(width / 2, height);
	}
};
var draw = new p5(s, 'pad');
var globalDraw = draw;