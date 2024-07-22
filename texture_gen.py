from PIL import Image
import numpy as np
from json import loads, dumps
def value_to_color(value, max_value):
   if value > max_value: value = max_value
   value = 1 - (value / max_value)
   return (127 * 2 * (max(value, 0.5) - 0.5), 0, 127 * 2 * min(value, 0.5))
all_waypoints = []
all_waypoints_dict = {}
for i in range(-10, 11):
   for j in range(-10, 11):
      file = open(f'points/{i},{j}.json', 'r+').read()
      waypoint_list = loads(file)
      for w in waypoint_list: 
         all_waypoints_dict[w['name']] = w
         all_waypoints.append(w)
open('all_points.json', 'w+').write(dumps(all_waypoints_dict))
for i in range(-10, 11):
   for j in range(-10, 11):
      tilex = i * 500
      tiley = j * 500
      pixels = []
      resolution = 100
      for y in range(0, 500, round(500 / resolution)):
         row = []
         for x in range(0, 500, round(500 / resolution)):
            pixel_coordinate = [tilex + x, tiley + y]
            closest_distance = 500
            for w in all_waypoints:
               distance = ((pixel_coordinate[0] - w['x']) ** 2 + (pixel_coordinate[1] - w['y']) ** 2) ** 0.5
               if distance < closest_distance:
                  closest_distance = distance
            row.append(value_to_color(closest_distance, 350))
         pixels.append(row)
      # Convert the pixels into an array using numpy
      array = np.array(pixels, dtype=np.uint8)
      # Use PIL to create an image from the new array of pixels
      new_image = Image.fromarray(array)
      fname = f'{i},{j}.png'
      new_image.save('textures/closest_waypoint/' + fname)
      print(fname)
