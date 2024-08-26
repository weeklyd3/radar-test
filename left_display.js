var fcount = 0;
function drawLeftDisplay(draw, width, height) {
	fcount++;
	draw.clear();
	draw.background('cyan');
	draw.push();
	draw.translate(width / 2, height / 2);
	draw.image(loaded_images.ship, -25, -37.5);
	draw.push();
	draw.push();
	draw.translate(0, 35);
	var engine_turn = -40 * player.turnRate / player.maxTurnRate;
	draw.rotate(engine_turn);
	draw.image(loaded_images.engine, -7.5, -15);
	var cannon_angle = (Math.atan2(height / 2 - globalDraw.mouseY, -width / 2 + globalDraw.mouseX) * 180 / Math.PI + 270) % 360;
	draw.pop();
	draw.rotate(-cannon_angle);
	draw.image(loaded_images.cannon, -12.5, -60 + 12.5);
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
			player.bullets.push({
				x: engine_exhaust_position[0] + (Math.random() - 0.5) * 0,
				y: engine_exhaust_position[1],
				speed: -35 * ((Math.random() - 0.5) * 0.4 + 0.8) * player.engine.current_n1,
				heading: player.heading + engine_turn + (Math.random() - 0.5) * 10 * player.engine.current_n1,
				lifetime: 40,
				size: 2 + (player.engine.current_n1 + (Math.random() - 0.5) * 0.5) * 7,
				damage: 0.1,
				color: draw.color(color, color, color, 50 + Math.random() * (50 + 50 * player.engine.current_n1))
			});
		}
	}
	draw.strokeWeight(0);
	player.bullets = player.bullets.filter((a) => !a.invalid);
	if (click) {
		var position = rotatePoint([player.x, player.y - 60 + 12.5], [player.x, player.y], player.heading - cannon_angle);
		player.bullets.push({
			x: position[0],
			y: position[1],
			heading: player.heading - cannon_angle,
			speed: player.gun.speed + (Math.random() - 0.5) * player.gun.speedRandom,
			lifetime: player.gun.lifetime,
			color: player.gun.color,
			size: player.gun.size,
			damage: player.gun.damage
		})
	}
	for (const p of player.bullets) {
		particlePhysics(p);
		try {
			draw.fill(p.color ?? (p.enemy ? 'red': 'blue'));
		} catch (e) {
			console.log(JSON.stringify(p.color) ?? (p.enemy ? 'red' : 'blue'), e);
		}
		draw.circle(p.x - player.x, p.y - player.y, p.size);
	}
	draw.pop();
	draw.push();
	draw.translate(width / 2, height / 2);
	draw.rotate(-player.heading);
	loadEnemies(draw, width, height);
	draw.pop();
	draw.push();
	draw.translate(width / 2, height / 2);
	draw.translate(0, height / 2 - width * 0.15);
	draw.fill('black');
	draw.rect(-width / 2, -width * 0.15, width * 0.7, width * 0.3);
	draw.fill('white');
	draw.rect(-width / 2 + width * 0.35 - 1, -width * 0.1, 2, width * 0.3);
	const selectedQuestName = player.quest_list[player.selected_quest];
	var activeQuest = quests[selectedQuestName];
	var activeQuestProgress = player.quests[selectedQuestName];
	draw.textAlign('left', 'top');
	if (activeQuestProgress[1]) {
		draw.fill('cyan');
		draw.rect(-width / 2, -width * 0.125 - 1, width / 2, 2);
	}
	draw.textSize(width * 0.03);
	draw.text(activeQuest.name, -width / 2, -width * 0.14);
	draw.textAlign('right', 'top');
	draw.text(`${player.selected_quest + 1}/${player.quest_list.length}`, width * 0.2, -width * 0.14);
	draw.textAlign('left', 'top');
	draw.textSize(9);
	draw.text(activeQuest.body, -width / 2, -width * 0.1, width * 0.35, width * 0.3);
	var index = 0;
	for (const obj of activeQuest.objectives) {
		if (getBit(activeQuestProgress[0], index)) {
			draw.fill('cyan');
			draw.rect(-width / 2 + width * 0.35 + 2, -width * 0.1 + 15 * index, 10, 10);
			draw.rect(-width / 2 + width * 0.35 + 2, -width * 0.1 + 15 * index + 15 / 4, width * 0.325, 2);
		}
		else {
			draw.fill('lime');
			draw.circle(-width / 2 + width * 0.35 + 7, -width * 0.1 + 15 * index + 5, 5);
		}
		draw.text(obj.body, -width / 2 + width * 0.35 + 12, -width * 0.1 + 15 * index);
		index += 1;
	}
	draw.translate(width * 0.35, 0);
	draw.fill('lightgray');
	draw.arc(0, 0, width * 0.3, width * 0.3, 255, 285);
	draw.fill('gray');
	draw.circle(0, 0, width * 0.25);
	draw.strokeWeight(1);
	draw.stroke('white');
	draw.textSize(width * 0.03);
	draw.fill('black');
	draw.rotate(-player.heading);
	var text;
	draw.textAlign('center', 'center');
	for (var i = 0; i < 36; i++) {
		draw.line(0, -width * 0.1, 0, -width * 0.125);
		text = '';
		if (i == 0) text = 'N';
		if (i == 9) text = 'E';
		if (i == 18) text = 'S';
		if (i == 27) text = 'W';
		if (text) draw.text(text, 0, -width * 0.08);
		draw.rotate(10);
	}
	draw.rotate(player.heading);
	draw.fill('magenta');
	draw.triangle(0, -8, 6, 5, -6, 5);
	draw.stroke('magenta');
	draw.line(0, 0, 0, -width * 0.1);
	draw.pop();
}
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