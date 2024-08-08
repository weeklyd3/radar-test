from json import dumps, loads
from random import random, choices
from math import floor, sin, cos, radians
all_waypoints = loads(open('all_points.json', 'r+').read())
points_eligible_for_enemies = []
for w in all_waypoints.values():
	add = False
	if (w['y'] > 1000): add = True
	if (w['y'] < -1000 and (w['x'] > -3000 or w['x'] < -4000)): add = True
	if (add): points_eligible_for_enemies.append(w)
print(len(points_eligible_for_enemies))
enemy_chance = 0.5
points_with_enemies = list(filter(lambda a: random() < enemy_chance, points_eligible_for_enemies))
output = {}
for i in range(-10, 10):
	for j in range(-10, 10): output[f'{i},{j}'] = {}
def create_key(x, y):
	return str(floor(x / 500)) + ',' + str(floor(y / 500))
for p in points_with_enemies:
	key = create_key(p['x'], p['y'])
	if key not in output: output[key] = {}
	number_to_create = floor(3 + random() * 4)
	enemy_types = ['basic']
	enemy_weights = [1]
	for i in range(number_to_create):
		radius = 50 + random() * 10
		angle = 360 / number_to_create * i
		x = p['x']
		y = p['y']
		x += sin(radians(angle)) * radius
		y += cos(radians(angle)) * radius
		enemy_type = choices(enemy_types, enemy_weights)[0]
		id = str(hash(enemy_type + str(x) + str(y) + str(i)))
		output[key][id] = {
			'type': enemy_type,
			'x': x,
			'y': y,
			'home': p['name'],
			'id': id
		}
for key, value in output.items():
	open(f'island_enemies/{key}.json', 'w+').write(dumps(value))