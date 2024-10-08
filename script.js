var save_frame_count = 0;
function physics() {
	var thrust = 3500;
	var thrust_force = thrust * (n1ToThr(player.engine.current_n1) + player.engine.idle_n1) / (1 + player.engine.idle_n1);
	var drag_force = drag(
		(player.velocity[0] ** 2 + player.velocity[1] ** 2) ** 0.5 * 24,
	);
	if (player.engine.parking_brake && player.engine.current_n1 > 0.3)
		player.engine.parking_brake = false;
	if (player.engine.braking) thrust_force -= 10000;
	if (player.engine.parking_brake) thrust_force -= 100000;
	if (player.engine.autothrottle) {
		var thrust_required = drag_force / thrust;
		if (thrust_required < player.engine.idle_n1)
			player.engine.autothrottle = false;
		else {
			if (thrust_required > player.engine.max_n1)
				thrust_required = player.engine.max_n1;
			var cmd_throttle =
				(thrust_required - player.engine.idle_n1) /
				(player.engine.max_n1 - player.engine.idle_n1);
			player.engine.cmd_throttle = cmd_throttle;
		}
	}
	thrust_force -= drag_force;
	var acceleration = thrust_force / player.mass;
	var total_velocity =
		(player.velocity[0] ** 2 + player.velocity[1] ** 2) ** 0.5;
	if (player.turnRate) {
		if (player.turnRate > player.maxTurnRate)
			player.turnRate = player.maxTurnRate;
		if (player.turnRate < -player.maxTurnRate)
			player.turnRate = -player.maxTurnRate;
		player.heading += (player.turnRate * total_velocity) / 2;
	}
	while (player.heading < 0) player.heading += 360;
	while (player.heading >= 360) player.heading -= 360;
	total_velocity += acceleration / 24;
	if (total_velocity < 0) total_velocity = 0;
	var x = Math.sin((player.heading * Math.PI) / 180) * total_velocity;
	var y = -Math.cos((player.heading * Math.PI) / 180) * total_velocity;
	player.velocity[0] = x;
	player.velocity[1] = y;
}
function drawParameter(draw, param) {
	draw.textAlign("right", "center");
	draw.text(param.name, -12, 0);
	draw.rect(-2, -1, 4, 2);
	var param_value = param.value;
	if (param_value < param.min) param_value = param.min;
	if (param_value > param.max) param_value = param.max;
	const tens = 10 ** param.decimals;
	var value = (Math.floor(param_value * tens) / tens).toFixed(param.decimals);
	var unboundedValue = (Math.floor(param.value * tens) / tens).toFixed(param.decimals);
	if (param.dial) {
		draw.push();
		draw.fill(draw.color(0, 0, 0, 0));
		draw.strokeWeight(1);
		draw.arc(46, 0, 60, 60, 150, 30);
		var char_width = draw.textWidth('0');
		draw.strokeWeight(0);
		draw.translate(46, 0);
		draw.fill("lime");
		draw.textAlign("center", "center");
		var char_number = 0;
		const line_height = 15;
		for (const digit of unboundedValue.split('')) {
			char_number++;
			var y_offset = 0;
			if (char_number == unboundedValue.length) {
				y_offset = (param.value - unboundedValue) / (1 / tens) * line_height;
			} else if (Number(digit) == Number(digit)) {
				var next_digit = unboundedValue[char_number];
				var next_digit_index = char_number;
				if (next_digit == '.') {
					next_digit = unboundedValue[char_number + 1];
					next_digit_index++;
				}
				console.assert(next_digit != '.');
				console.assert(next_digit == value[next_digit_index])
				if (next_digit == '9' && unboundedValue[unboundedValue.length - 1] == '9') {
					console.assert(unboundedValue[next_digit_index] == '9');
					var fragment = param.value.toFixed(15).slice(unboundedValue.length);
					fragment = fragment.replace('.', '');
					y_offset = fragment / (10 ** (fragment.length)) * line_height;
				}
			}
			const x = 20 - (value.length - char_number) * char_width;
			draw.text(digit, x, 20 + y_offset);
			if (digit == '9' && char_number == 1) draw.text('1', x - char_width, 20 - line_height + y_offset);
			if (Number(digit) == Number(digit)) {
				draw.text((Number(digit) + 1) % 10, x, 20 - line_height + y_offset);
				if (y_offset > line_height / 2) draw.text((Number(digit) + 2) % 10, x, 20 - 2 * line_height + y_offset);
				draw.text((Number(digit) + 9) % 10, x, 20 + line_height + y_offset);
			}
		}
		//draw.text(param.value.toFixed(param.decimals), 0, 20);
		draw.fill('black');
		draw.rect(-25, -15, 45 - char_width / 2, 25);
		draw.rect(-25, 28, 45 - char_width / 2, 40);
		draw.rect(20 - char_width / 2, -15, char_width, 18);
		draw.rect(20 - char_width / 2, 35, char_width, 33);
		draw.strokeWeight(1);
		draw.fill(draw.color(0, 0, 0, 0));
		draw.beginShape();
		draw.vertex(20 - char_width / 2, 10);
		draw.vertex(20 + char_width * -4.5, 10);
		draw.vertex(20 + char_width * -4.5, 28);
		draw.vertex(20 - char_width / 2, 28);
		draw.vertex(20 - char_width / 2, 35);
		draw.vertex(20 + char_width / 2, 35);
		draw.vertex(20 + char_width / 2, 3);
		draw.vertex(20 - char_width / 2, 3);
		draw.endShape('close');
		draw.fill("green");
		draw.strokeWeight(0);
		draw.rotate(240);
		var trend = param.hasOwnProperty("trend");
		var rotate_amount =
			((param_value - param.min) / (param.max - param.min)) * 240;
		if (trend) {
			var trend_amount =
				(param.trend / (param.max - param.min)) * 240 * 240 * 12;
		}
		draw.rotate(rotate_amount);
		if (trend && trend_amount > 0)
			draw.arc(0, 0, 60, 60, 270, 270 + trend_amount);
		if (trend && trend_amount < 0)
			draw.arc(0, 0, 60, 60, 270 + trend_amount, 270);
		draw.fill("lime");
		draw.circle(0, 0, 5);
		draw.rect(-1, -30, 2, 30);
		draw.rotate(-rotate_amount);
		draw.fill("white");
		for (var i = 0; i < 11; i++) {
			draw.rect(-0.5, -35, 1, 5);
			draw.rotate(24);
		}
		draw.rotate(-264);
		if (param.hasOwnProperty("commanded_value")) {
			var cmd_value = param.commanded_value;
			var cmd_rotate_amount =
				((cmd_value - param.min) / (param.max - param.min)) * 240;
			draw.fill("cyan");
			draw.rotate(cmd_rotate_amount);
			draw.triangle(0, -33, -3, -41, 3, -41);
		}
		draw.pop();
		draw.fill("white");
	} else {
		draw.textAlign("center", "center");
		draw.text(param.value.toFixed(param.decimals), 46, 0);
	}
}
function loadZone(name) {
	waypoints[name] = [];
	var numbers = name.split(",");
	var x = Number(numbers[0]);
	var y = Number(numbers[1]);
	if (x < -10 || x > 10) return;
	if (y < -10 || y > 10) return;
	if (localStorage.getItem("RADARTEST-points-" + name)) {
		waypoints[name] = JSON.parse(
			localStorage.getItem("RADARTEST-points-" + name),
		);
		return;
	}
	fetch("points/" + name + ".json")
		.then((s) => s.json())
		.then((s) => {
			waypoints[name] = s;
			localStorage.setItem("RADARTEST-points-" + name, JSON.stringify(s));
		});
}
function drawWaypoints(draw, width, height) {
	var ratio = (player.full_map ? height * 0.425 : height * 0.85) / player.map_range;
	if (player.water_on_map) {
		draw.fill('blue');
		draw.circle(0, 0, player.full_map ? height * 8 : height * 1.7);
	}
	var realMapRange;
	if (player.full_map) realMapRange = (((width / 2) ** 2 + (height / 2) ** 2) ** 0.5) / ratio;
	else realMapRange = player.map_range;
	draw.fill("lime");
	draw.strokeWeight(0);
	var position = [player.x, player.y];
	var offset = Math.ceil(realMapRange / 500);
	var min_range = [player.zoneX - offset, player.zoneY - offset];
	var max_range = [player.zoneX + offset, player.zoneY + offset];
	for (var x = min_range[0]; x <= max_range[0]; x++) {
		for (var y = min_range[1]; y <= max_range[1]; y++) {
			if (player.map_texture) {
				if (!textures[player.map_texture])
					textures[player.map_texture] = {};
				var texture_object = textures[player.map_texture];
				if (!texture_object[`${x},${y}`]) {
					var url = `textures/${player.map_texture}/${x},${y}.png`;
					texture_object[`${x},${y}`] = globalDraw.loadImage(url);
				}
				target = texture_object[`${x},${y}`];
				if (target)
					draw.image(
						texture_object[`${x},${y}`],
						((x - player.zoneX) * 500 - player.zoneXOffset) * ratio,
						((y - player.zoneY) * 500 - player.zoneYOffset) * ratio,
						500 * ratio,
						500 * ratio,
					);
			}
			if (!waypoints[x + "," + y]) {
				loadZone(x + "," + y);
			} else {
				for (const wpt of waypoints[x + "," + y]) {
					var distance = ((player.x - wpt.x) ** 2 + (player.y - wpt.y) ** 2) ** 0.5;
					if (distance > realMapRange) continue;
					var angle =
						(Math.atan2(player.y - wpt.y, wpt.x - player.x) * 180) /
						Math.PI;
					angle = player.heading + angle;
					var angle_rad = (angle * Math.PI) / 180;
					var dx = distance * Math.cos(angle_rad);
					var dy = -distance * Math.sin(angle_rad);
					dx *= ratio;
					dy *= ratio;
					if (player.water_on_map) {
						draw.fill('#4c3924');
						draw.circle(dx, dy, 60 * ratio);
					}
					if (player.route_points.includes(wpt.name)) {
						draw.fill("yellow");
						draw.circle(dx, dy, 8);
						draw.strokeWeight(1);
						draw.stroke('yellow');
						draw.fill(draw.color(0, 0, 0, 0));
						draw.circle(dx, dy, 60 * ratio);
						draw.strokeWeight(0);
						draw.fill('yellow');
					} else {
						draw.fill('lime');
						draw.circle(dx, dy, 3);
					}
					draw.text(wpt.name.toUpperCase(), dx, dy + 10);
					draw.fill("lime");
				}
			}
		}
	}
	draw.push();
	draw.stroke("yellow");
	draw.strokeWeight(3);
	var previous_position = [0, 0];
	for (const r of player.route) {
		var heading = r.heading - player.heading;
		var distance = r.distance;
		var calibratedPosition = [
			distance * Math.sin((heading * Math.PI) / 180) * ratio +
				previous_position[0],
			-distance * Math.cos((heading * Math.PI) / 180) * ratio +
				previous_position[1],
		];
		draw.line(...previous_position, ...calibratedPosition);
		previous_position = calibratedPosition;
	}
	draw.pop();
}
function drawDisplay(draw, width, height) {
	draw.clear();
	if (!player.display && nav_display.height >= globalDraw.height * 0.6) {
		nav_display.resizeCanvas(width, globalDraw.height * 0.6);
		display2_header.resizeCanvas(width, globalDraw.height * 0.6);
	}
	if (!player.display && engine_display.height >= globalDraw.height * 0.4) {
		engine_display.resizeCanvas(width, globalDraw.height * 0.4);
	}
	if (player.display == 1 && nav_display.height < globalDraw.height) {
		console.log("resizing to full");
		nav_display.resizeCanvas(width, globalDraw.height);
		display2_header.resizeCanvas(width, globalDraw.height);
	}
	if (player.display == 2 && engine_display.height < globalDraw.height) {
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
	if (player.display == 3) {
		drawMenu(menu_display, width, height);
		draw.image(menu_display, 0, 0);
	}
}
function save() {
	var json = JSON.stringify(player);
	localStorage.setItem('RADARTEST-save', json);
}
function tempFactor(temp) {
	return (1 + 0.2105 * (temp - 20) / 20);
}
function thrToN1(thr) {
	const n1 = player.engine.idle_n1 / 2 +
	player.engine.idle_n1 / 2 * tempFactor(player.temperature) +
	(thr * tempFactor(player.temperature)) *
		(player.engine.max_n1 - player.engine.idle_n1);
	return n1;
}
function n1ToThr(n1) {
	const thr = (n1 - (player.engine.idle_n1 / 2 + player.engine.idle_n1 / 2 * tempFactor(player.temperature))) / tempFactor(player.temperature) / (player.engine.max_n1 - player.engine.idle_n1);
	return thr;
}
function update() {
	save_frame_count++;
	if ((save_frame_count % 100) == 0) save();
	player.speed = (player.velocity[0] ** 2 + player.velocity[1] ** 2) ** 0.5;
	if (player.autopilot) {
		if (!player.route.length) player.autopilot = false;
		else {
			var required_heading = player.route[0].heading;
			// https://stackoverflow.com/a/60237892/15578194
			var rightTurn = ((360 + player.heading - required_heading) % 360) > 180;
			if (rightTurn) diff_angle = (360 - player.heading + required_heading) % 360;
			else diff_angle = -((360 + player.heading - required_heading) % 360);
			player.turnRate = diff_angle / 50;
		}
	}
	physics();
	player.x += player.velocity[0];
	player.y += player.velocity[1];
	if (player.display != 3) {
		if (draw.keyIsDown(37) || draw.keyIsDown(39) || draw.keyIsDown(68) || draw.keyIsDown(65)) {
			var amount = 0.05;
			if (draw.keyIsDown(39) || draw.keyIsDown(68)) player.turnRate += amount;
			if (draw.keyIsDown(37) || draw.keyIsDown(65)) player.turnRate -= amount;
			if (player.turnRate < -player.maxTurnRate)
				player.turnRate = -player.maxTurnRate;
			if (player.turnRate > player.maxTurnRate)
				player.turnRate = player.maxTurnRate;
		}
		player.engine.braking = false;
		if (draw.keyIsDown(38) || draw.keyIsDown(40) || draw.keyIsDown(87) || draw.keyIsDown(83)) {
			var amount = 0.01;
			if (draw.keyIsDown(16)) amount = 0.001;
			if (draw.keyIsDown(38) || draw.keyIsDown(87)) player.engine.cmd_throttle += amount;
			if (draw.keyIsDown(40) || draw.keyIsDown(83)) {
				player.engine.cmd_throttle -= amount;
				if (player.engine.current_n1 <= player.engine.idle_n1)
					player.engine.braking = true;
			}
			if (player.engine.cmd_throttle > 1) player.engine.cmd_throttle = 1;
			if (player.engine.cmd_throttle < 0) player.engine.cmd_throttle = 0;
		}
	}
	player.engine.current_epr =
		0.983 +
		0.02 * Math.min(1, player.engine.current_n1 / 0.19) +
		0.83 * Math.max(0, (player.engine.current_n1 - 0.19) / 0.85);
	player.engine.current_ff = (player.engine.max_ff - player.engine.idle_ff) * (player.engine.current_n1 - player.engine.idle_n1) / (player.engine.max_n1 - player.engine.idle_n1) + player.engine.idle_ff;
	player.engine.cmd_n1 = thrToN1(player.engine.cmd_throttle);
	player.engine.cmd_epr = 1.003 + 0.83 * player.engine.cmd_throttle;
	player.engine.current_n1 += player.engine.trend_n1;
	player.zoneX = Math.floor(player.x / 500);
	player.zoneY = Math.floor(player.y / 500);
	player.zoneXOffset = player.x - 500 * player.zoneX;
	player.zoneYOffset = player.y - 500 * player.zoneY;
	var first_point = player.route[0];
	if (first_point) {
		first_point.distance =
			((first_point.x - player.x) ** 2 +
				(first_point.y - player.y) ** 2) **
			0.5;
		first_point.heading =
			(Math.atan2(first_point.x - player.x, -first_point.y + player.y) *
				180) /
			Math.PI;
	}
	for (const r of player.route) {
		if (r.heading < 0) r.heading += 360;
	}
	var first_point = player.route[0];
	if (
		first_point &&
		((first_point.x - player.x) ** 2 + (first_point.y - player.y) ** 2) **
			0.5 <
			30
	) {
		var name = first_point.name.toLowerCase();
		if (player.route_points.indexOf(name) > -1)
			player.route_points.splice(player.route_points.indexOf(name), 1);
		player.route.splice(0, 1);
	}
	draw.clear();
	updateQuests();
	drawDisplay(display2, width / 2, height);
	drawLeftDisplay(display1, width / 2, height);
	draw.image(display1, 0, 0);
	draw.image(display2, width / 2, 0);
	if (Math.abs(player.engine.cmd_n1 - player.engine.current_n1) <= 0.005) {
		player.engine.current_n1 = player.engine.cmd_n1;
		player.engine.trend_n1 = 0;
	}
	if (
		Math.abs(player.engine.cmd_n1 - player.engine.current_n1) > 0.005 ||
		Math.abs(player.engine.trend_n1) > 0.001
	) {
		var simulated_trend = player.engine.trend_n1;
		var stopping_distance = 0;
		while (Math.abs(simulated_trend) > 0.001) {
			stopping_distance += simulated_trend;
			if (simulated_trend > player.engine.max_trend_change_n1)
				simulated_trend -= player.engine.max_trend_change_n1;
			else if (simulated_trend < -player.engine.max_trend_change_n1)
				simulated_trend += player.engine.max_trend_change_n1;
			else simulated_trend = 0;
		}
		if (
			Math.abs(stopping_distance * 1.01) >
			Math.abs(player.engine.cmd_n1 - player.engine.current_n1)
		) {
			if (player.engine.trend_n1 < -player.engine.max_trend_change_n1)
				player.engine.trend_n1 += player.engine.max_trend_change_n1;
			else if (player.engine.trend_n1 > player.engine.max_trend_change_n1)
				player.engine.trend_n1 -= player.engine.max_trend_change_n1;
			else player.engine.trend_n1 = 0;
		} else {
			if (player.engine.cmd_n1 < player.engine.current_n1)
				player.engine.trend_n1 -= player.engine.max_trend_change_n1;
			else player.engine.trend_n1 += player.engine.max_trend_change_n1;
			if (player.engine.trend_n1 > player.engine.max_trend_n1)
				player.engine.trend_n1 = player.engine.max_trend_n1;
			if (player.engine.trend_n1 < -player.engine.max_trend_n1)
				player.engine.trend_n1 = -player.engine.max_trend_n1;
		}
	}
}
function keydown(ev) {
	if (player.display == 3) return;
	if (ev.keyCode == 33) player.selected_quest -= 1;
	if (ev.keyCode == 34) player.selected_quest += 1;
	if (player.selected_quest < 0) player.selected_quest = player.quest_list.length - 1;
	if (player.selected_quest >= player.quest_list.length) player.selected_quest = 0;
	if (ev.keyCode == 79) player.full_map = !player.full_map;
	if (ev.keyCode == 80) player.autopilot = !player.autopilot;
	if (ev.keyCode == 67)
		player.engine.autothrottle = !player.engine.autothrottle;
	if (ev.keyCode == 86) {
		player.display += 1;
		if (player.display > 3) player.display = 0;
	}
	if (ev.keyCode == 66)
		player.engine.parking_brake = !player.engine.parking_brake;
}
var click = false;
addEventListener("keydown", keydown);
addEventListener('mousedown', () => click = true);
addEventListener('mouseup', () => click = false);
var waypoints = {};
var all_waypoints = {};
fetch("all_points.json")
	.then((s) => s.json())
	.then((s) => (all_waypoints = s));
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
		display1.angleMode('degrees');
		display1.textWrap('WORD');
		display1.textSize(9);
		display1.textAlign('left', 'top');
		// display1.textAlign('center', 'center');
		display2 = draw.createGraphics(width / 2, height);
		display2.textFont("Consolas");
		display2.angleMode("degrees");
		display2.background("black");
		display2.textAlign("center", "center");
		nav_display = draw.createGraphics(width / 2, height);
		nav_display.textFont("Consolas");
		nav_display.angleMode("degrees");
		nav_display.textAlign("center", "center");
		engine_display = draw.createGraphics(width / 2, height);
		engine_display.textFont("Consolas");
		engine_display.angleMode("degrees");
		engine_display.stroke("white");
		engine_display.textAlign("center", "center");
		engine_display.textSize(15);
		display2_header = draw.createGraphics(width / 2, height);
		menu_display = draw.createGraphics(width / 2, height);
		menu_display.textFont("Consolas");
		menu_display.angleMode("degrees");
		menu_display.stroke("white");
		menu_display.textAlign("center", "center");
		menu_display.textSize(15);
		loaded_images.ship = draw.loadImage('actually_useful_images/ship.svg');
		loaded_images.engine = draw.loadImage('actually_useful_images/engine.svg');
		loaded_images.cannon = draw.loadImage('actually_useful_images/cannon.svg');
		for (const e in enemy_types) {
			enemy_types[e].image = draw.loadImage('actually_useful_images/enemy_' + e + '.svg');
		}
	};
};
var draw = new p5(s, "pad");
var globalDraw = draw;
