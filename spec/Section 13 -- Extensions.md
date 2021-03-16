Extensions
-------

# Extensions

Extensions are the capabilities which extend GROQ queries beyond basic Spec. These capabilities can include function namespaces, functions and operators. However, extensions can not introduce a new syntax.

## Portable Text Extension

### pt type

PT type represents an object following [portable text spec](undefined).

### global::pt()

It takes in an object or an array of objects, and returns a PT value.

global::pt(args, scope):

* If the length of {args} is not 1:
  * Return {null}.
* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is an object:
  * Try to parse it as Portable Text Block:
  * If {base }is a valid Portable Text Block:
      * Return {base}.
* If {base} is an array of objects:
  * Try to parse it as an array of Portable Text blocks:
  * If all elements in {base} array are valid Portable Text blocks:
      * Return {base}.
* Otherwise:
  * Return {null}.

global::ptValidate(args):

* If the length of {args} is not 1:
  * Report an error.

### pt::text()

It takes in a PT value and returns a string versions of text. PT value which consists of more than one Portable text block has blocks appended with double newline character (`\n\n`) in the string version. 

pt::text(args, scope):

* If the length of {args} is not 1:
  * Return {null}.
* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is an object:
  * Try to parse it as Portable Text Block:
  * If {base }is a valid Portable Text Block:
      * Return string version of text in {base}.
* If {base} is an array of objects:
  * Try to parse it as an array of Portable Text blocks:
  * If all elements in {base} array are valid Portable Text blocks:
      * Return string version of text in {base}.
* Otherwise:
  * Return {null}.

pt::textValidate(args):

* If the length of {args} is not 1:
  * Report an error.

## Geo Extension

### geo type

Geo type represents a geography and can contain points, lines, polygons which are representable as a Geo Point or in GeoJSON. Concretely, an object is coerced to geo type if:

1. If the object is Geo Point, that is it has a key `lat` for lattitude and a key `lng` or `lon` for longitude (but not both).
2. If the object has [GeoJSON](https://tools.ietf.org/html/rfc7946) representation.

Geo type supports following GeoJSON Geometry Objects:

1. `Position`
2. `Point`
3. `MultiPoint`
4. `LineString`
5. `MultiLineString`
6. `Polygon`
7. `MultiPolygon`.

And, it does not support:

1. GeoJSON Geometry Object  `GeometryCollection`.
2. GeoJSON Object `Feature` and `FeatureCollection`. 
3. Array of GeoJSON Points, instead a GeoJSON MultiPoint should be used.

### global::geo()

This function is a constructor for geo value of geo type. It takes an object or another geo value, returning a geo value.

global::geo(args, scope):

* If the length of {args} is not 1:
  * Return {null}.
* Let {baseNode} be the first element of {args}.
* Let {base} be the result of {Evaluate(baseNode, scope)}.
* If {base} is an object:
  * Try to parse it as Geo Point and GeoJSON:
  * If {base }is a valid geo value:
      * Return {base}.
* If {base} is a geo value:
  * Return {base}.
* Otherwise:
  * Return {null}.

global::geoValidate(args):

* If the length of {args} is not 1:
  * Report an error.

### geo::contains()

Returns true if when first geo value is completely contains the second one, that is polygon created by first geo value contains all the points represented in second geo value.

geo::contains(args, scope):

* If the length of {args} is not 2:
  * Return {null}.
* Let {firstNode} be the first element of {args}.
* Let {secondNode} be the second element of {args}.
* Let {first} be the result of {Evaluate(firstNode, scope)}.
* Let {second} be the result of {Evaluate(secondNode, scope)}.
* If {first} or {second} is a not a geo value:
  * Return {null}.
* If {first} completely contains {second}:
  * Return {true}.
* Otherwise:
  * Return {false}.

geo::containsValidate(args):

* If the length of {args} is not 2:
  * Report an error.

### geo::intersects()

It takes in two geo point arguments and returns true if first geo value intersects the second one, that is polygon created by first geo value intersects with or contains atleast one of the edge represented in second geo value polygon.

geo::intersects(args, scope):

* If the length of {args} is not 2:
  * Return {null}.
* Let {firstNode} be the first element of {args}.
* Let {secondNode} be the second element of {args}.
* Let {first} be the result of {Evaluate(firstNode, scope)}.
* Let {second} be the result of {Evaluate(secondNode, scope)}.
* If {first} or {second} is a not a geo value:
  * Return {null}.
* If {first} intersects {second}:
  * Return {true}.
* Otherwise:
  * Return {false}.

geo::intersectsValidate(args):

* If the length of {args} is not 2:
  * Report an error.

### geo::distance()

It accepts two Geo Points or GeoJSON Points and returns the distance in meters. Lines/Polygons are not supported.

geo::distance(args, scope):

* If the length of {args} is not 2:
  * Return {null}.
* Let {firstNode} be the first element of {args}.
* Let {secondNode} be the second element of {args}.
* Let {first} be the result of {Evaluate(firstNode, scope)}.
* Let {second} be the result of {Evaluate(secondNode, scope)}.
* If {first} or {second} is a not a geo value:
  * Return {null}.
* If {first} or {second} is a not a Geo Point or GeoJSON Point:
  * Return {null}.
* Let {distance} be the [HaverSine distance](https://en.wikipedia.org/wiki/Haversine_formula) between {first} and {second}:
  * Return {distance}.
* Otherwise:
  * Return {null}.

geo::distanceValidate(args):

* If the length of {args} is not 2:
  * Report an error.
