var pages = {
	'weight': function(draw, width, height) {
		var list = [
			['Base', 54000],
			['Fuel', player.engine.current_fuel]
		];
		var total = 0;
		for (const l of list) total += l[1];
		list.push(['TOTAL', total]);
		var text = 'WEIGHT\n';
		for (const l of list) {
			text += `${l[0]}: ${Math.round(l[1] / 10) * 10} kg`;
			text += '\n';
		}
		var thrust = 3500 * player.engine.current_n1;
		text += '\n';
		text += `THRUST\n`;
		text += `Current ${Math.round(thrust / 10) * 10} N\n`;
		text += `Available ${Math.round(3500 * player.engine.max_n1 / 10) * 10} N\n`;
		var max_speed = Math.sqrt((3500 * player.engine.max_n1) / 12 / 0.6 / 1.202) / 1000 * 3600;
		text += `Current speed ${Math.round((player.velocity[0] ** 2 + player.velocity[1] ** 2) ** 0.5 * 1000 / 3600)} mph\n`;
		text += `Max speed ${Math.round(max_speed)} mph`;
		draw.text(text, 0, 0);
		return player.engine.current_fuel < 200;
	}
};
const page_list = Object.keys(pages);