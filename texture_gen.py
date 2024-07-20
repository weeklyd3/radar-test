from PIL import Image
import numpy as np
from json import loads
def value_to_color(value, max_value):
   value = value / max_value
   return (255 * value, 255 * (1 - value), 0)
all_waypoints = []
for i in range(-10, 11):
   for j in range(-10, 11):
      file = open(f'points/{i},{j}.json', 'r+').read()
      waypoint_list = loads(file)
      for w in waypoint_list: all_waypoints.append(w)
for i in range(-10, 11):
   for j in range(-10, 11):
      tilex = i * 500
      tiley = j * 500
      pixels = []
      resolution = 50
      for x in range(0, 500, round(500 / resolution)):
         row = []
         for y in range(0, 500, round(500 / resolution)):
            pixel_coordinate = [tilex + x, tiley + y]
            closest_distance = 500
            for w in all_waypoints:
               distance = ((pixel_coordinate[0] - w['x']) ** 2 + (pixel_coordinate[1] - w['y']) ** 2) ** 0.5
               if distance < closest_distance:
                  closest_distance = distance
            row.append(value_to_color(closest_distance, 500))
         pixels.append(row)
      # Convert the pixels into an array using numpy
      array = np.array(pixels, dtype=np.uint8)
      # Use PIL to create an image from the new array of pixels
      new_image = Image.fromarray(array)
      fname = f'{i},{j}.png'
      new_image.save('textures/closest_waypoint/' + fname)
      print(fname)