function drawMap(draw, width, height) {
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
	draw.fill('white');
	draw.circle(...map_center, 5);
	var map_radius = height * 0.85;
	draw.translate(...map_center);
	draw.rotate(-map_heading);
	draw.fill(draw.color(0, 0, 0, 0));
	draw.stroke('white');
	draw.rotate(player.heading);
	drawWaypoints(draw, width, height);
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
	draw.pop();
}
function loadZone(name) {
	waypoints[name] = [];
	var numbers = name.split(',');
	var x = Number(numbers[0]);
	var y = Number(numbers[1]);
	console.log(x, y);
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
					console.log(url);
					texture_object[`${x},${y}`] = globalDraw.loadImage(url);
				}
				target = texture_object[`${x},${y}`];
				if (target) draw.image(texture_object[`${x},${y}`], ((x - player.zoneX) * 500 - player.zoneXOffset) * ratio, ((y - player.zoneY) * 500 - player.zoneYOffset) * ratio, 500 * ratio, 500 * ratio);
			}
			if (!waypoints[x + ',' + y]) {
				console.log('LOAD', x + ',' + y)
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
					draw.text(wpt.name.toUpperCase(), dx, dy - 10);
				}
			}
		}
	}
}
function update() {
	player.zoneX = Math.floor(player.x / 500);
	player.zoneY = Math.floor(player.y / 500);
	player.zoneXOffset = player.x - 500 * player.zoneX;
	player.zoneYOffset = player.y - 500 * player.zoneY;
	draw.clear();
	drawMap(display2, width / 2, height);
	draw.image(display1, 0, 0);
	draw.image(display2, width / 2, 0);
}
var player = {
	x: 0,
	y: 0,
	heading: 0,
	map_range: 918,
	map_texture: ''
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
		display2.angleMode('degrees');
		display2.background('black');
		display2.textAlign('center', 'center');
		display2_header = draw.createGraphics(width / 2, height);
	}
};
var draw = new p5(s, 'pad');
var globalDraw = draw;