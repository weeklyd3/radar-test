function drawMap(draw, width, height) {
	var map_radius = height * 0.85;
	if (player.full_map) map_radius = height * 0.425;
	if (globalDraw.keyIsDown(173) || globalDraw.keyIsDown(61)) {
		var currentRatio = player.map_range / (map_radius);
		if (globalDraw.keyIsDown(173)) currentRatio += 0.1;
		else currentRatio -= 0.1;
		currentRatio = Math.round(10 * currentRatio) / 10;
		if (currentRatio < 0.5) currentRatio = 0.5;
		if (currentRatio > 10) currentRatio = 10;
		player.map_range = map_radius * currentRatio;
	}
	if (player.map_range > (map_radius * 10)) player.map_range = map_radius * 10;
	display2_header.clear();
	display2_header.fill('black');
	display2_header.rect(0, 0, width, height);
	display2_header.erase();
	var map_center = [width / 2, height * 0.95];
	if (player.full_map) map_center[1] -= height * 0.425;
	display2_header.circle(...map_center, player.full_map ? map_radius * 8 : map_radius * 2);
	display2_header.noErase();
	draw.clear();
	draw.push();
	draw.background('black');
	var map_heading = player.heading;
	draw.translate(...map_center);
	draw.rotate(-map_heading);
	draw.fill(draw.color(0, 0, 0, 0));
	draw.stroke('white');
	draw.rotate(player.heading);
	drawWaypoints(draw, width, height);
	draw.fill(draw.color(0, 0, 0, 0));
	draw.strokeWeight(1);
	draw.stroke('white');
	draw.triangle(-10, 14, 10, 14, 0, -14);
	draw.strokeWeight(0);
	draw.image(display2_header, -width / 2, -map_center[1], width, height);
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
	if (!player.full_map) draw.circle(0, 0, map_radius * 2);
	draw.push();
	draw.rotate(player.heading);
	if (player.route.length) {
		draw.fill('yellow');
		draw.rotate(player.route[0].heading - player.heading);
		draw.rect(-width / 26, -map_radius - 12, width / 13, 12);
		draw.strokeWeight(0);
		draw.fill('black');
		draw.text(Math.round(player.route[0].heading), 0, -map_radius - 6);
		draw.rotate(-player.route[0].heading + player.heading);
	}
	draw.strokeWeight(1);
	draw.fill('magenta');
	draw.rect(-width / 26, -map_radius - 12, width / 13, 12);
	draw.stroke('magenta');
	draw.line(0, -14, 0, -map_radius);
	draw.stroke('white');
	draw.fill('black');
	draw.strokeWeight(0);
	draw.text(Math.round(player.heading), 0, -map_radius - 6);
	draw.fill('white');
	draw.textAlign('right', 'center');
	var waypoint_info = '';
	if (player.route.length > 0) {
		const wpt = player.route[0];
		waypoint_info = `${wpt.name} ${Math.round(wpt.heading)}deg ${(wpt.distance / 1000).toFixed(2)}mi\n`
	}
	draw.text(waypoint_info + 'map zoom ×' + Math.round(10 * player.map_range / map_radius) / 10 + "\nrange " + Math.round(player.map_range) + " px", width / 2, -map_radius + height * 0.02);
	draw.textAlign('left', 'center');
	draw.text(`${player.autopilot ? "AUTOPILOT " : "MANUAL RUD "}| ${player.engine.autothrottle ? "CRUISE CTRL" : "MANUAL THR"}\n${player.engine.parking_brake ? "PARKING BRAKE!!! [b]\n" : ""}${Math.round((player.velocity[0] ** 2 + player.velocity[1] ** 2) ** 0.5 * 24 / 1000 * 3600)} mph\nthr ${Math.round(3500 * player.engine.current_n1)}\ndrag ${Math.round(drag((player.velocity[0] ** 2 + player.velocity[1] ** 2) ** 0.5) * 24 * 24)}`, -width / 2, -map_radius + height * 0.02);
	draw.rect(-width / 6, -height * 0.08 - map_radius, width / 3, 2);
	draw.rect(-width / 6, -height * 0.08 - map_radius, 2, 10);
	draw.rect(width / 6 - 2, -height * 0.08 - map_radius, 2, 10);
	draw.rect(-1, -height * 0.08 - map_radius, 2, 10);
	draw.fill('magenta');
	if (player.engine.braking) draw.fill('yellow');
	var x_rudder = (player.turnRate / player.maxTurnRate) * width / 6;
	draw.triangle(x_rudder, -map_radius - height * 0.07, x_rudder - 5, -map_radius - height * 0.05, x_rudder + 5, -map_radius - height * 0.05);
	draw.pop();
	draw.pop();
	var ratio = (player.full_map ? height * 0.425 : height * 0.85) / player.map_range;
	drawEnemiesOnMap(draw, width, height, ratio);
}
function drawEngine(draw, width, height) {
	draw.clear();
	draw.push();
	draw.strokeWeight(0);
	draw.background('black');
	draw.fill('white');
	var offset = 100;
	var parameters = [
		{
			name: 'Throttle',
			x: -offset,
			y: 30,
			min: 0,
			max: 100,
			value: (player.engine.current_n1 - player.engine.idle_n1) / (player.engine.max_n1 - player.engine.idle_n1) * 100,
			decimals: 1,
			dial: true,
			commanded_value: player.engine.cmd_throttle * 100
		},
		{
			name: "CMD THR",
			x: offset,
			y: -20,
			min: 0,
			max: 100,
			value: player.engine.cmd_throttle * 100,
			dial: false,
			decimals: 1,
			hide: player.display != 2
		},
		{
			name: 'EPR',
			x: -offset,
			y: 30,
			min: 0.9,
			max: 1.9,
			value: player.engine.current_epr,
			decimals: 3,
			dial: true,
			commanded_value: player.engine.cmd_epr
		},
		{
			name: 'CMD EPR',
			x: offset,
			no_change_y: true,
			y: -20,
			min: 0.9,
			max: 1.9,
			value: player.engine.cmd_epr,
			decimals: 3,
			dial: false,
			hide: player.display != 2
		},
		{
			name: 'N1',
			x: -offset,
			y: 30,
			min: 0,			
			max: 104,
			value: player.engine.current_n1 * 100,
			decimals: 1,
			dial: player.display == 2,
			trend: player.engine.trend_n1,
			commanded_value: player.engine.cmd_n1 * 100
		},
		{
			name: 'CMD N1',
			x: offset,
			y: -20,
			no_change_y: true,
			min: 0,
			max: 104,
			value: player.engine.cmd_n1 * 100,
			decimals: 1,
			dial: false,
			hide: player.display != 2
		},
		{
			name: 'N2',
			y: 30,
			min: 0,
			max: 100.2,
			value: player.engine.current_n2 * 100,
			decimals: 1,
			dial: player.display == 2
		},
		{
			name: "Fuel per hour",
			min: 0,
			y: 35,
			max: Infinity,
			value: player.engine.current_ff,
			decimals: 0,
			dial: false
		}
	];
	player.engine.current_fuel -= player.engine.current_ff / 3600 / 24;
	draw.push();
	var selected_page = page_list[player.selected_page];
	var start_height = 300;
	player.mass = (player.engine.current_fuel + 54000);
	if (height == globalDraw.height) {
		draw.translate(width / 2, start_height + (height - start_height) / 2);
		draw.fill('green');
		if (player.engine.display_warning) draw.fill('#990000');
		draw.rect(-width / 2, -(height - start_height) / 2, width, height - start_height);
		draw.fill('white');
		player.engine.display_warning = pages[selected_page](draw, width, height - start_height);
	}
	draw.pop();
	draw.translate(width / 2, 10);
	var full_screen = height == globalDraw.height;
	var translate_height = 0;
	for (const param of parameters) {
		if (param.hide) continue;
		draw.translate(full_screen ? (param.x ?? 0) : 0, full_screen ? param.y : (param.dial ? 35 : 10));
		translate_height += full_screen ? param.y : (param.dial ? 35 : 10);
		drawParameter(draw, param);
		draw.translate(full_screen ? (-param.x ?? 0) : 0, full_screen ? (param.y < 0 ? 30 : param.y) : (param.dial ? 35 : 10));
		translate_height += full_screen ? (param.y < 0 ? 30 : param.y) : (param.dial ? 35 : 10);
	}
	draw.pop();
}
function drawMenu(draw, width, height) {
	draw.clear();
	draw.background('black');
	draw.push();
	draw.strokeWeight(0);
	var display_route = [...player.route];
	var you = {
		x: player.x,
		y: player.y,
		name: "<current position>",
		distance: 0,
		heading: player.heading,
	}
	display_route.splice(0, 0, you);
	var start_index = 0;
	draw.textSize(18);
	draw.fill('blue');
	draw.rect(0, 0, width, 30);
	draw.fill('white');
	draw.text('ROUTE', width / 2, 15);
	var entries = Math.floor(height / 30) - 3;
	draw.translate(width / 2, 15);
	var missed_points = 0;
	start_index = Math.floor(selected_index / entries) * entries;
	for (var i = start_index; i < (start_index + entries); i++) {
		var point = display_route[i];
		if (!point) {
			missed_points += 1;
			continue;
		}
		draw.translate(0, 30);
		if (i == selected_index) {
			draw.fill('green');
			draw.rect(-width / 2, -15, width, 30);
			draw.fill('white');
		}
		draw.textAlign('left', 'center');
		draw.text(point.name, -width / 2, 0);
		draw.text(`${point.heading.toFixed(0)} deg/${(point.distance / 1000).toFixed(2)} mi`, 0, 0);
	}
	draw.translate(0, 30 * missed_points + 30);
	var msg = "up/down = select, delete = delete, a = add after";
	if (menu_input) msg = "type to enter, enter = ok, esc = cancel";
	if (menu_timing >= 0) {
		menu_timing -= 1;
		msg = menu_message;
	}
	draw.text(msg, -width / 2, 0);
	if (menu_input) {
		draw.translate(0, 30);
		draw.text(menu_input_msg + "█", -width / 2, 0);
	}
	draw.pop();
}
addEventListener('keydown', function(ev) {
	if (player.display != 3) return;
	if (!menu_input) {
		if (ev.keyCode == 86) player.display = -1;
		if (ev.keyCode == 40) selected_index += 1;
		if (ev.keyCode == 38) selected_index -= 1;
		if (ev.keyCode == 8 || ev.keyCode == 46) {
			if (selected_index == 0) {
				menu_message = "You can't delete that!";
				menu_timing = 48;
			} else {
				console.log(player.route[selected_index - 1]);
				var name = player.route[selected_index - 1].name;
				var index = player.route_points.indexOf(name.toLowerCase());
				if (index != -1) {
					player.route_points.splice(index, 1);
				}
				player.route.splice(selected_index - 1, 1);
			}
		}
		if (ev.keyCode == 65) menu_input = true;
		if (selected_index < 0) selected_index = player.route.length;
		if (selected_index > player.route.length) selected_index = 0;
	} else {
		if (ev.keyCode == 8) menu_input_msg = menu_input_msg.slice(0, -1);
		if (48 <= ev.keyCode && ev.keyCode < 58) menu_input_msg += '0123456789'[ev.keyCode - 48];
		if (ev.keyCode == 27) menu_input = false;
		if (ev.keyCode == 32) menu_input_msg += ' ';
		if (ev.keyCode >= 65 && ev.keyCode <= 90) menu_input_msg += ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[ev.keyCode - 65]);
		if (ev.keyCode == 173) menu_input_msg += '-';
		if (ev.keyCode == 13) {
			var input = menu_input_msg.trim().toLowerCase();
			if (all_waypoints[input]) {
				var point = all_waypoints[input];
				var new_point = {
					name: input.toUpperCase(),
					x: point.x,
					y: point.y
				};
				if (selected_index > 0) {
					var previous_point = player.route[selected_index - 1];
					new_point.distance = ((new_point.x - previous_point.x) ** 2 + (new_point.y - previous_point.y) ** 2) ** 0.5;
					new_point.heading = Math.atan2(new_point.x - previous_point.x, -new_point.y + previous_point.y) * 180 / Math.PI;
				}
				player.route.splice(selected_index, 0, new_point);
				player.route_points.push(input);
				menu_input = false;
				menu_input_msg = '';
				selected_index += 1;
				recalculateHeadings(player.route);
				return;
			}
			if (input.includes(' ')) {
				var split = input.split(' ');
				if (split.length == 2) {
					var numbers = [Number(split[0]), Number(split[1])];
					if (numbers[0] == numbers[0] && numbers[1] == numbers[1]) {
						var new_point = {
							name: `X${Math.round(numbers[0])}Y${Math.round(numbers[1])}`,
							x: numbers[0],
							y: numbers[1]
						};
						if (selected_index > 0) {
							var previous_point = player.route[selected_index - 1];
							new_point.distance = ((new_point.x - previous_point.x) ** 2 + (new_point.y - previous_point.y) ** 2) ** 0.5;
							new_point.heading = Math.atan2(new_point.x - previous_point.x, -new_point.y + previous_point.y) * 180 / Math.PI;
						}
						player.route.splice(selected_index, 0, new_point);
						menu_input = false;
						menu_input_msg = '';
						selected_index += 1;
							recalculateHeadings(player.route);
						return;
					}
				}
			}
		}
	}
})
function recalculateHeadings(points) {
	var position = [player.x, player.y];
	for (const p of points) {
		p.distance = ((p.x - position[0]) ** 2 + (p.y - position[1]) ** 2) ** 0.5;
		p.heading = Math.atan2(p.x - position[0], -p.y + position[1]) * 180 / Math.PI;
		position[0] = p.x;
		position[1] = p.y;
	}
}
var menu_message = '';
var menu_input_msg = '';
var menu_timing = -1;
var menu_input = false;
var selected_index = 0;
function drag(speed) {
	return 12 * 0.6 * 1.202 * speed ** 2;
}