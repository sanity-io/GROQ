# Extensions

Extensions are the capabilities which extend GROQ queries beyond basic Spec. These capabilities can include function namespaces, functions and operators. However, extensions can not introduce a new syntax.

## Portable Text Extension

Functions available in Portable text extension are grouped under `pt` namespace except for the constructor which is global.

### pt type

PT type represents an object following [portable text spec](https://github.com/portabletext/portabletext).

### global::pt()

This function takes in an object or an array of objects, and returns a PT value.

global_pt(args, scope):

- Let {baseNode} be the first element of {args}.
- Let {base} be the result of {Evaluate(baseNode, scope)}.
- If {base} is an object:
  - Try to parse it as Portable Text Block:
  - If {base} is a valid Portable Text Block:
    - Return {base}.
- If {base} is an array of objects:
  - Try to parse it as an array of Portable Text blocks:
    - If all elements in {base} array are valid Portable Text blocks:
      - Return {base}.
- Otherwise:
  - Return {null}.

global_pt_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### pt::text()

This function takes in a PT value and returns a string versions of text. PT value which consists of more than one Portable text block has blocks appended with double newline character (`\n\n`) in the string version.

pt_text(args, scope):

- Let {baseNode} be the first element of {args}.
- Let {base} be the result of {Evaluate(baseNode, scope)}.
- If {base} is an object:
  - Try to parse it as Portable Text Block:
  - If {base }is a valid Portable Text Block:
    - Return string version of text in {base}.
- If {base} is an array of objects:
  - Try to parse it as an array of Portable Text blocks:
  - If all elements in {base} array are valid Portable Text blocks:
    - Return string version of text in {base}.
- Otherwise:
  - Return {null}.

pt_text_validate(args):

- If the length of {args} is not 1:
  - Report an error.

## Geography Extension

Functions available in Geography extension are grouped under `geo` namespace except for the constructor which is global.

### geo type

The geo type represents a geography and can contain points, lines, and polygons which can be expressed with a single latitude/longitude coordinate, or as a GeoJSON object. Concretely, an object is coerced to the geo type if:

1. If the object is coerced to a geographic point, that is it has a key `lat` for latitude and a key `lng` or `lon` for longitude (but not both).
2. If the object has [GeoJSON](https://tools.ietf.org/html/rfc7946) representation.

Geo type supports following GeoJSON Geometry Objects:

1. `Position`
2. `Point`
3. `MultiPoint`
4. `LineString`
5. `MultiLineString`
6. `Polygon`
7. `MultiPolygon`
8. `GeometryCollection`

And, it does not support:

1. GeoJSON Object `Feature` and `FeatureCollection`.
2. Arrays of geographic values. Instead, one of the GeoJSON `Multi` types should be used.

### global::geo()

This function is a constructor for geographic value. It takes an object or another geo value, returning a geo value.

global_geo(args, scope):

- Let {baseNode} be the first element of {args}.
- Let {base} be the result of {Evaluate(baseNode, scope)}.
- If {base} is an object:
  - Try to parse it as Geo Point and GeoJSON:
  - If {base} is a valid geo value:
    - Return {base}.
- If {base} is a geo value:
  - Return {base}.
- Otherwise:
  - Return {null}.

global_geo_validate(args):

- If the length of {args} is not 1:
  - Report an error.

### geo::latLng()

Takes latitude and longitude as arguments and returns a Geo Point.

geo_latLng(args, scope):

- Let {latNode} be the first element of {args}.
- Let {lngNode} be the second element of {args}.
- Let {lat} be the result of {Evaluate(latNode, scope)}.
- Let {lng} be the result of {Evaluate(lngNode, scope)}.
- If {lat} or {lng} is not a number:
  - Return {null}.
- If {lat} is not in the range of -90 to 90:
  - Return {null}.
- If {lng} is not in the range of -180 to 180:
  - Return {null}.
- Otherwise:
  - Return a GeoJSON Point with {lat} and {lng} as coordinates, in lng, lat order.

geo_latLng_validate(args):

- If the length of {args} is not 2:
  - Report an error.

### geo::contains()

Returns true if first geo argument completely contains the second one, using a planar (non-spherical) coordinate system. Both geo argument can be any geo value. A geo value is considered contained if all its points are within the boundaries of the first geo value. For `MultiPolygon`, it's sufficient that only one of the polygons contains the first geo value.

geo_contains(args, scope):

- Let {firstNode} be the first element of {args}.
- Let {secondNode} be the second element of {args}.
- Let {first} be the result of {Evaluate(firstNode, scope)}.
- Let {second} be the result of {Evaluate(secondNode, scope)}.
- If {first} or {second} is a not a geo value:
  - Return {null}.
- If {first} completely contains {second}:
  - Return {true}.
- Otherwise:
  - Return {false}.

geo_contains_validate(args):

- If the length of {args} is not 2:
  - Report an error.

### geo::intersects()

This function takes two geo values, and returns true if they intersect in a planar (non-spherical) coordinate system. The arguments can be any geo values. A geo value intersects with another if it shares any geometric points with the second value; for example, a line crossing a polygon.

geo_intersects(args, scope):

- Let {firstNode} be the first element of {args}.
- Let {secondNode} be the second element of {args}.
- Let {first} be the result of {Evaluate(firstNode, scope)}.
- Let {second} be the result of {Evaluate(secondNode, scope)}.
- If {first} or {second} is a not a geo value:
  - Return {null}.
- If {first} intersects {second}:
  - Return {true}.
- Otherwise:
  - Return {false}.

geo_intersects_validate(args):

- If the length of {args} is not 2:
  - Report an error.

### geo::distance()

This functions accepts two geo values, which must be point values, and returns the distance in meters. While exact algorithm is implementation-defined — for example, it may use the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula) — it should use as close an approximation to a real Earth distance as possible.

geo_distance(args, scope):

- Let {firstNode} be the first element of {args}.
- Let {secondNode} be the second element of {args}.
- Let {first} be the result of {Evaluate(firstNode, scope)}.
- Let {second} be the result of {Evaluate(secondNode, scope)}.
- If {first} or {second} is a not a geo value:
  - Return {null}.
- If {first} or {second} is a not a Geo Point or GeoJSON Point:
  - Return {null}.
- Let {distance} be the geographic distance between {first} and {second}:
  - Return {distance}.
- Otherwise:
  - Return {null}.

geo_distance_validate(args):

- If the length of {args} is not 2:
  - Report an error.

## Documents Extension

Functions available in Documents extension are grouped under the `documents` namespace.

### Global Document Reference type

A Global Document Reference (GDR) type represents a reference to a document. The referenced document can be in a dataset separate from the dataset of the query context in the current scope.

A GDR consists of a string formatted to uniquely identify a dataset and a document within that dataset.

MatchesGDR({gdr}, {datasetID}, {documentID}):

- If {gdr} is not a string:
  - Return {false}.
- If {gdr} is not in a valid Global Document Reference format:
  - Return {false}.
- Let {gdrDatasetID} be the unique identifier for the dataset identified by {gdr}.
- Let {gdrDocumentID} be the unique identifier for the document identified by {gdr}.
- If {Equal(gdrDatasetID, datasetID)} is {true} and {Equal(gdrDatasetID, datasetID)} is {true}:
  - Return {true}.
- Otherwise:
  - Return {false}.

### documents::get()

This function takes a Global Document Reference referencing a document and returns the document.

documents_get(args, scope):

- Let {gdrNode} be the first element of {args}.
- Let {gdr} be the result of {Evaluate(gdrNode, scope)}.
- If {gdr} is not a string:
  - Return {null}.
- If {gdr} is not in a valid Global Document Reference format:
  - Return {null}.
- Let {sources} be a list of other data sources in the query context of {scope}.
- For each {source} in {sources}:
  - If {source} is a dataset:
    - Let {datasetID} be a unique identifier for the {source} dataset.
    - For each {document} in the {source} dataset:
      - If {document} is an object and has an attribute `_id`:
        - Let {documentID} be the value of the attribute `_id` in {document}.
        - If {MatchesGDR(gdr, datasetID, documentID)} is {true}:
          - return {document}.
- Return {null}.

documents_get_validate(args, scope):

- If the length of {args} is not 1:
  - Report an error.

### documents::incomingGlobalDocumentReferenceCount()

This function returns the number of Global Document References referencing a document.

documents_incomingGlobalDocumentReferenceCount(args, scope):

- Let {document} be this value in {scope}.
- Let {\_incomingGDRCount} be a property of {document} which represents the number of Global Document References referencing {document}. This property is updated whenever a Global Document Reference to {document} is created or deleted.
- If {\_incomingGDRCount} is {null}:
  - Return {null}.
- Otherwise:
  - Return {\_incomingGDRCount}.

documents_incomingGlobalDocumentReferenceCount_validate(args, scope):

- If the length of {args} is not 0:
  - Report an error.
