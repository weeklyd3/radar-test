var quests = {
	"navigation": {
		"name": "Learn to Navigate",
		"body": "Press UP and DOWN to change thrust and LEFT and RIGHT to steer. Use the [v] key to change the right display. Enter the route WHEDC, TIMUT, IONVE, THESA, FARTO and go to FARTO. After that, throttle below 30% N1 and use [b] to set park brake. (Use autopilot [p] and cruise control [c] if necessary.)\n(use PgUp and PgDn to scroll this list)",
		"objectives": [
			{"body": "Get moving!", "validation": () => player.speed > 0.3},
			{"body": "Visit WHEDC", "validation": () => distTo('whedc') < 60},
			{"body": "Visit TIMUT", "validation": () => distTo('timut') < 60},
			{"body": "Visit IONVE", "validation": () => distTo('ionve') < 60},
			{"body": "Visit THESA", "validation": () => distTo('thesa') < 60},
			{"body": "Visit FARTO", "validation": () => distTo('farto') < 60},
			{"body": "Stop and park brake at FARTO", "validation": () => { return distTo('farto') < 100 && player.speed < 0.05 && player.engine.parking_brake }}
		],
		"nextQuest": "shoot"
	},
	"shoot": {
		"name": "Tutorial: Shoot!",
		"body": "Use your mouse to aim and click ANYWHERE to shoot. ANYWHERE. The mouse is used EXCLUSIVELY for shooting.",
		"objectives": [
			{"body": "Fire something!", "validation": () => {return player.bullets.length > 0}},
			{"body": "Defeat enemies at <idk>", "validation": () => false}
		]
	}
};
function dist(x1, y1, x2, y2) {
	return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}
function distTo(waypoint) {
	if (!all_waypoints[waypoint]) return Infinity;
	return dist(player.x, player.y, all_waypoints[waypoint].x, all_waypoints[waypoint].y);
}
function updateQuests() {
	for (const q of player.quest_list) {
		if (player.quests[q][1]) continue;
		var index = -1;
		for (obj of quests[q].objectives) {
			index += 1
			if (getBit(player.quests[q][0], index)) continue;
			if (!obj.validation || obj.validation()) {
				completeQuestObjective(q, index);
				if (player.quests[q][0] == (2 ** quests[q].objectives.length - 1)) {
					player.quests[q][1] = true;
					if (quests[q].nextQuest) assignQuest(quests[q].nextQuest);
				}
			}
		}
	}
}
function getBit(number, bit) {
	var binary = (number >>> 0).toString(2);
	if (binary.length <= bit) binary = binary.padStart(bit - 1, '0');
	var reversed = binary.split('').reverse();
	return Boolean(Number(reversed[bit]));
}
function setBit(number, bit, to) {
	var binary = (number >>> 0).toString(2);
	if (binary.length <= bit) binary = binary.padStart(bit + 1, '0');
	var reversed = binary.split('').reverse();
	console.log(reversed);
	reversed[bit] = Number(Boolean(to));
	binary = reversed.reverse().join('');
	return parseInt(binary, 2);
}
function assignQuest(quest) {
	if (player.quests[quest]) return;
	player.quests[quest] = [0, false];
	player.quest_list.splice(0, 0, quest);
}
function completeQuestObjective(quest, objective) {
	console.log(objective);
	player.quests[quest][0] = setBit(player.quests[quest][0], objective, true);
	console.log('new', (player.quests[quest][0] >>> 0).toString(2));
}