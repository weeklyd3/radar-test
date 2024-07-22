function physics() {
	var thrust = 3500;
	var thrust_force = thrust * player.engine.current_n1;
	var drag_force = drag(
		(player.velocity[0] ** 2 + player.velocity[1] ** 2) ** 0.5 * 24,
	);
	if (player.engine.parking_brake && player.engine.current_n1 > 0.3) player.engine.parking_brake = false;
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
		draw.fill("lime");
		draw.textAlign("center", "center");
		draw.text(value, 60, 20);
		draw.fill("white");
	} else {
		draw.textAlign("left", "center");
		draw.text(value, 30, 0);
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
		waypoints[name] = JSON.parse(localStorage.getItem("RADARTEST-points-" + name));
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
	var ratio = (height * 0.85) / player.map_range;
	draw.fill("lime");
	draw.strokeWeight(0);
	var position = [player.x, player.y];
	var range = player.map_range;
	var offset = Math.ceil(range / 500);
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
					var distance =
						((player.x - wpt.x) ** 2 + (player.y - wpt.y) ** 2) **
						0.5;
					if (distance > player.map_range) continue;
					var angle =
						(Math.atan2(player.y - wpt.y, wpt.x - player.x) * 180) /
						Math.PI;
					angle = player.heading + angle;
					var angle_rad = (angle * Math.PI) / 180;
					var dx = distance * Math.cos(angle_rad);
					var dy = -distance * Math.sin(angle_rad);
					dx *= ratio;
					dy *= ratio;
					if (player.route_points.includes(wpt.name)) {
						draw.fill('yellow');
						draw.circle(dx, dy, 6);
					} else {
						draw.circle(dx, dy, 3);
					}
					draw.text(wpt.name.toUpperCase(), dx, dy + 10);
					draw.fill('lime');
				}
			}
		}
	}
	draw.push();
	draw.stroke('yellow');
	draw.strokeWeight(3);
	var previous_position = [0, 0];
	for (const r of player.route) {
		var heading = r.heading - player.heading;
		var distance = r.distance;
		var calibratedPosition = [
			 distance * Math.sin(heading * Math.PI / 180) * ratio + previous_position[0],
			-distance * Math.cos(heading * Math.PI / 180) * ratio + previous_position[1]
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
function update() {
	if (player.autopilot) {
		if (!player.route.length) player.autopilot = false;
		else {
			var required_heading = player.route[0].heading;
			player.turnRate = (required_heading - player.heading) / 50;
		}
	}
	physics();
	player.x += player.velocity[0];
	player.y += player.velocity[1];
	if (player.display != 3) {
		if (draw.keyIsDown(37) || draw.keyIsDown(39)) {
			var amount = 0.05;
			if (draw.keyIsDown(39)) player.turnRate += amount;
			if (draw.keyIsDown(37)) player.turnRate -= amount;
			if (player.turnRate < -player.maxTurnRate) player.turnRate = -player.maxTurnRate;
			if (player.turnRate > player.maxTurnRate) player.turnRate = player.maxTurnRate;
		}
		player.engine.braking = false;
		if (draw.keyIsDown(38) || draw.keyIsDown(40)) {
			var amount = 0.01;
			if (draw.keyIsDown(16)) amount = 0.001;
			if (draw.keyIsDown(38)) player.engine.cmd_throttle += amount;
			if (draw.keyIsDown(40)) {
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
	player.engine.cmd_n1 =
		player.engine.idle_n1 +
		player.engine.cmd_throttle *
			(player.engine.max_n1 - player.engine.idle_n1);
	player.engine.cmd_epr = 1.003 + 0.83 * player.engine.cmd_throttle;
	player.engine.current_n1 += player.engine.trend_n1;
	player.zoneX = Math.floor(player.x / 500);
	player.zoneY = Math.floor(player.y / 500);
	player.zoneXOffset = player.x - 500 * player.zoneX;
	player.zoneYOffset = player.y - 500 * player.zoneY;
	var first_point = player.route[0];
	if (first_point) {
		first_point.distance = ((first_point.x - player.x) ** 2 + (first_point.y - player.y) ** 2) ** 0.5;
		first_point.heading = Math.atan2(first_point.x - player.x, -first_point.y + player.y) * 180 / Math.PI;
	}
	for (const r of player.route) {
		if (r.heading < 0) r.heading += 360;
	}
	var first_point = player.route[0];
	if (first_point && ((first_point.x - player.x) ** 2 + (first_point.y - player.y) ** 2) ** 0.5 < 30) {
		var name = first_point.name.toLowerCase();
		if (player.route_points.indexOf(name) > -1) player.route_points.splice(player.route_points.indexOf(name), 1);
		player.route.splice(0, 1);
	}
	draw.clear();
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
	if (ev.keyCode == 80) player.autopilot = !player.autopilot;
	if (ev.keyCode == 67)
		player.engine.autothrottle = !player.engine.autothrottle;
	if (ev.keyCode == 86) {
		player.display += 1;
		if (player.display > 3) player.display = 0;
	}
	if (ev.keyCode == 66) player.engine.parking_brake = !player.engine.parking_brake;
}
addEventListener("keydown", keydown);
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
		display2 = draw.createGraphics(width / 2, height);
		display2.textFont("consolas");
		display2.angleMode("degrees");
		display2.background("black");
		display2.textAlign("center", "center");
		nav_display = draw.createGraphics(width / 2, height);
		nav_display.textFont("consolas");
		nav_display.angleMode("degrees");
		nav_display.textAlign("center", "center");
		engine_display = draw.createGraphics(width / 2, height);
		engine_display.textFont("consolas");
		engine_display.angleMode("degrees");
		engine_display.stroke("white");
		engine_display.textAlign("center", "center");
		engine_display.textSize(15);
		display2_header = draw.createGraphics(width / 2, height);
		menu_display = draw.createGraphics(width / 2, height);
		menu_display.textFont("consolas");
		menu_display.angleMode("degrees");
		menu_display.stroke("white");
		menu_display.textAlign("center", "center");
		menu_display.textSize(15);
	};
};
var draw = new p5(s, "pad");
var globalDraw = draw;
