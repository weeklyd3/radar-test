var fcount = 0;
function drawLeftDisplay(draw, width, height) {
	fcount++;
	draw.clear();
	draw.background('cyan');
	draw.push();
	draw.translate(width / 2, height / 2);
	draw.image(loaded_images.ship, -25, -37.5);
	draw.push();
	draw.translate(0, 35);
	var engine_turn = -40 * player.turnRate / player.maxTurnRate;
	draw.rotate(engine_turn);
	draw.image(loaded_images.engine, -7.5, -15);
	draw.pop();
	draw.rotate(-player.heading);
	draw.strokeWeight(0);
	for (var i = -1; i < 2; i++) {
		for (var j = -1; j < 2; j++) {
			var zone = `${i + player.zoneX},${j + player.zoneY}`;
			if (!waypoints[zone]) loadZone(zone);
			for (const wpt of waypoints[zone]) {
				draw.fill('gold');
				draw.circle(wpt.x - player.x, wpt.y - player.y, 60);
				draw.fill('lime');
				draw.circle(wpt.x - player.x, wpt.y - player.y, 50);
			}
		}
	}
	if ((fcount % Math.ceil(2 / player.engine.current_n1)) == 0) {
		var engine_position = rotatePoint([player.x, player.y + 35], [player.x, player.y], player.heading);
		var engine_exhaust_position = rotatePoint(movePointAtAngle(engine_position, -8, player.heading), engine_position, engine_turn);
		for (var i = 0; i < player.engine.current_n1 * 2; i++) {
			var color = 200 - (player.engine.current_n1 * 160) + (Math.random() - 0.5) * 60;
			exhaustParticles.push({
				x: engine_exhaust_position[0] + (Math.random() - 0.5) * 0,
				y: engine_exhaust_position[1],
				speed: -35 * ((Math.random() - 0.5) * 0.4 + 0.8) * player.engine.current_n1,
				heading: player.heading + engine_turn + (Math.random() - 0.5) * 10 * player.engine.current_n1,
				lifetime: 40,
				size: 2 + (player.engine.current_n1 + (Math.random() - 0.5) * 0.5) * 7,
				color: draw.color(color, color, color, 50 + Math.random() * (50 + 50 * player.engine.current_n1))
			});
		}
	}
	exhaustParticles = exhaustParticles.filter((a) => !a.invalid);
	draw.strokeWeight(0);
	for (const p of exhaustParticles) {
		particlePhysics(p);
		draw.fill(p.color);
		draw.circle(p.x - player.x, p.y - player.y, p.size);
	}
	player.bullets = player.bullets.filter((a) => !a.invalid);
	if (click) player.bullets.push({
		x: player.x,
		y: player.y,
		heading: player.heading,
		speed: player.gun.speed,
		lifetime: player.gun.lifetime,
		color: player.gun.color,
		size: player.gun.size
	})
	for (const p of player.bullets) {
		particlePhysics(p);
		draw.fill(p.color ?? (p.enemy ? 'red': 'blue'));
		draw.circle(p.x - player.x, p.y - player.y, p.size);
	}
	draw.pop();
}
var exhaustParticles = [];
function rotatePoint(point, origin, amount) {
	var distance = ((point[0] - origin[0]) ** 2 + 
				   (point[1] - origin[1]) ** 2) ** 0.5;
	var angle = Math.atan2(point[0] - origin[0],
						  origin[1] - point[1]) * 180 / Math.PI;
	angle += amount;
	var result = movePointAtAngle([0, 0], distance, angle);
	var x = result[0];
	var y = result[1];
	return [origin[0] + x, origin[1] + y];
}
function movePointAtAngle(point, distance, angle) {
	var x =  Math.sin(angle * Math.PI / 180) * distance;
	var y = -Math.cos(angle * Math.PI / 180) * distance;
	return [point[0] + x, point[1] + y];
}
function particlePhysics(particle) {
	var speed_split = rotatePoint([0, -particle.speed], [0, 0], particle.heading);
	particle.x += speed_split[0];
	particle.y += speed_split[1];
	if (!particle.hasOwnProperty('frames')) particle.frames = 0;
	particle.frames++;
	if (particle.hasOwnProperty('lifetime')) {
		if (particle.lifetime < particle.frames) particle.invalid = true;
	}
}