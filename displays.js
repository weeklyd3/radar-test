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
	draw.rotate(player.heading);
	draw.fill('white');
	draw.strokeWeight(0);
	draw.textAlign('right', 'center');
	draw.text('map zoom ×' + Math.round(10 * player.map_range / map_radius) / 10 + "\nrange " + Math.round(player.map_range) + " px", width / 2, -height * 0.85);
	draw.textAlign('left', 'center');
	draw.text(`${Math.round((player.velocity[0] ** 2 + player.velocity[1] ** 2) ** 0.5 * 24 / 1000 * 3600)} mph`, -width / 2, -height * 0.85);
	draw.rect(-width / 6, -height * 0.93, width / 3, 2);
	draw.rect(-width / 6, -height * 0.93, 2, 10);
	draw.rect(width / 6 - 2, -height * 0.93, 2, 10);
	draw.rect(-1, -height * 0.93, 2, 10);
	draw.fill('magenta');
	if (player.engine.braking) draw.fill('yellow');
	var x_rudder = (player.turnRate / player.maxTurnRate) * width / 6;
	draw.triangle(x_rudder, -height * 0.92, x_rudder - 5, -height * 0.9, x_rudder + 5, -height * 0.9);
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
			trend: player.engine.trend_n1,
			commanded_value: player.engine.cmd_n1 * 100
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
function drag(speed) {
	return 12 * 0.6 * 1.202 * speed ** 2;
}