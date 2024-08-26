var loaded_enemies = {};
function loadEnemies(draw, width, height) {
	var diagonal = ((width / 2) ** 2 + (height / 2) ** 2) ** 0.5;
	for (var x = player.zoneX - 2; x < player.zoneX + 3; x++) {
		for (y = player.zoneY - 2; y < player.zoneY + 3; y++) {
			var key = `${x},${y}`;
			if (x < -10 || x > 10) continue;
			if (y < -10 || y > 10) continue;
			if (!loaded_enemies[key]) loadEnemyZone(key);
			const zone = loaded_enemies[key];
			if (!zone) continue;
			if (!zone.list) {
				continue;
			}
			for (const e of zone.list) {
				if (dist(e.x, e.y, player.x, player.y) >= diagonal * 1.5)
					continue;
				if (player.enemy_progress[e.id]) {
					if (player.enemy_progress[e.id].health <= 0) continue;
				}
				if (dist(e.x, e.y, player.x, player.y) <= ((width / 2) ** 2 + (height / 2) ** 2) ** 0.5) {
					for (const b of player.bullets) {
						if (rotatedRectangleCircleCollision(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height, e.heading, b.x, b.y, b.size / 2)) damageEnemy(e, b);
					}
				}
				draw.push();
				draw.translate(e.x - player.x, e.y - player.y);
				draw.rotate(-e.heading);
				draw.image(
					enemy_types[e.type].image,
					-e.width / 2,
					-e.height / 2,
					e.width,
					e.height,
				);
				if (player.enemy_progress[e.id]) {
					var health = player.enemy_progress[e.id].health;
					var maxHealth = player.enemy_progress[e.id].maxHealth;
					if (health < maxHealth) {
						draw.stroke('black');
						draw.fill('black');
						draw.strokeWeight(1);
						draw.rect(-e.width / 2, -e.height / 2 - 7, e.width, 3);
						draw.fill(draw.color(255 - 255 * health / maxHealth, 255 * health / maxHealth, 0));
						draw.rect(-e.width / 2, -e.height / 2 - 7, e.width * health / maxHealth, 3);
					}
				}
				draw.pop();
			}
		}
	}
}
function rotatedRectangleCircleCollision(x, y, w, h, hdg, cx, cy, r) {
	var local_coordinates = rotatePoint([cx, cy], [x + w / 2, y + h / 2], hdg);
	return rectangleCircleCollision(x, y, w, h, ...local_coordinates, r);
}
function rectangleCircleCollision(x, y, w, h, cx, cy, r) {
	// not perfect but it works
	return ((x - r) <= cx) && (cx <= (x + w + r)) &&
		(((y - r) <= cy) && ((y + h + r) >= cy))
}
function drawEnemiesOnMap(draw, width, height, ratio) {
	var map_radius = height * 0.85;
	if (player.full_map) map_radius = height * 0.425;
	var map_center = [width / 2, height * 0.95];
	if (player.full_map) map_center[1] -= height * 0.425;
	draw.push();
	draw.translate(...map_center);
	draw.rotate(-player.heading);
	draw.stroke("red");
	draw.fill(draw.color(0, 0, 0, 0));
	draw.strokeWeight(1);
	var radar_range = 500;
	draw.circle(0, 0, radar_range * 2 * ratio);
	draw.strokeWeight(0);
	draw.fill("red");
	for (var x = player.zoneX - 2; x < player.zoneX + 3; x++) {
		for (y = player.zoneY - 2; y < player.zoneY + 3; y++) {
			var key = `${x},${y}`;
			var zone = loaded_enemies[key];
			if (!zone) continue;
			if (!zone.list) continue;
			for (const p of zone.list) {
				if (player.enemy_progress[p.id]) {
					if (player.enemy_progress[p.id].health <= 0) continue;
				}
				if (dist(p.x, p.y, player.x, player.y) > radar_range) continue;
				draw.circle(
					(p.x - player.x) * ratio,
					(p.y - player.y) * ratio,
					5,
				);
			}
		}
	}
	draw.pop();
}
function damageEnemy(enemy, bullet) {
	bullet.invalid = true;
	if (!player.enemy_progress[enemy.id]) player.enemy_progress[enemy.id] = enemy;
	player.enemy_progress[enemy.id].health -= bullet.damage ?? 0;
	if (player.enemy_progress[enemy.id].health <= 0) {
		player.enemy_counter++;
	}
}
function loadEnemyZone(key) {
	function process(a, ls = true) {
		if (ls) localStorage.setItem("RADARTEST-enemies-" + key, JSON.stringify(a));
		for (const k in a) {
			const type = enemy_types[a[k].type];
			for (const type_key in type) {
				if (type_key == "image") continue;
				if (!a[k].hasOwnProperty(type_key))
					a[k][type_key] = type[type_key];
			}
			if (!player.enemy_progress[k]) continue;
			for (const type_key in player.enemy_progress[k]) {
				if (type_key == "image") continue;
				if (!a[k].hasOwnProperty(type_key))
					a[k][type_key] = type[type_key];
			}
			if (player.enemy_progress[k].health < 0) {
				delete a[k];
				continue;
			}
		}
		loaded_enemies[key] = {
			list: Object.values(a),
			object: a,
			ids: Object.keys(a),
		};
	}
	if (localStorage.getItem("RADARTEST-enemies-" + key)) {
		process(JSON.parse(localStorage.getItem("RADARTEST-enemies-" + key)), false);
		return;
	}
	loaded_enemies[key] = { list: [], object: {}, ids: [] };
	fetch("island_enemies/" + key + ".json")
		.then((r) => r.json())
		.then(process);
}
