from random import random
from json import dumps
from math import floor
min_coord = -5000
max_coord = 5000
from pronounceable import PronounceableWord
taken_words = []
waypoints = 1000
total_range = max_coord - min_coord
waypoint_collection = {}
for i in range(-5000, 5001, 500):
	for j in range(-5000, 5001, 500):
		print(i / 500, j / 500)
		waypoint_collection[f'{round(i / 500)},{round(j / 500)}'] = []
def create_key(x, y):
	return str(floor(x / 500)) + ',' + str(floor(y / 500))
for i in range(waypoints):
	x = (random() + min_coord / total_range) * total_range
	y = (random() + min_coord / total_range) * total_range
	word = PronounceableWord().length(5, 6)
	while word in taken_words: word = PronounceableWord().length(5, 6)
	taken_words.append(word)
	print(i, word, [round(x), round(y)], '->', create_key(x, y))
	waypoint_collection[create_key(x, y)].append({
		'x': x,
		'y': y,
		'name': word
	})
for key in waypoint_collection.keys():
	open('points/' + str(key) + '.json', 'w+').write(
		dumps(waypoint_collection[key])
	)