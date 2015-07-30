var Shapes = {
  Cone: function(numBasePoints) {
    var verts = [],
        wireframe = [],
        coneIndices = [],
        baseIndices = [];

    // center point at the top and in the base of the cone
    verts.push(vec3(0, 0.25, 0), vec3(0, -0.25, 0));
    coneIndices.push(0);
    baseIndices.push(1);

    for (var i = 0; i < numBasePoints; i++) {
      var theta = 2 * Math.PI * i / numBasePoints,
          idx = i + 2;  // including offset of two center points
      verts.push(vec3(Math.cos(theta)/4, -0.25, Math.sin(theta)/4));
      wireframe.push(0, idx);     // line from tip to here
      wireframe.push(1, idx);     // line from base center to here
      wireframe.push(idx, (idx+1) % (numBasePoints+2)); // line to next point
      coneIndices.push(idx);
      baseIndices.push(idx);
    }

    // wrap around the base
    wireframe[wireframe.length - 1] = 2;
    coneIndices.push(2);
    baseIndices.push(2);

    return {
      vertices: verts,
      faces: [{mode: "TRIANGLE_FAN", indices: coneIndices},
              {mode: "TRIANGLE_FAN", indices: baseIndices}],
      wireframe: wireframe
    };
  },
  Cylinder: function(numBasePoints) {
    var verts = [],
        wireframe = [],
        solid = [];

    // center point in both bases
    verts.push(vec3(0, 0.25, 0), vec3(0, -0.25, 0));
    solid.push(0);

    for (var i = 0; i < numBasePoints; i++) {
      var theta = 2 * Math.PI * i / numBasePoints,
          topIdx = 2*i + 2,
          nextTop = (topIdx % (2*numBasePoints)) + 2,
          bottomIdx = topIdx + 1,
          nextBottom = (bottomIdx % (2*numBasePoints)) + 2;

      verts.push(vec3(Math.cos(theta)/4, 0.25, Math.sin(theta)/4));
      verts.push(vec3(Math.cos(theta)/4, -0.25, Math.sin(theta)/4));
      wireframe.push(0, topIdx);
      wireframe.push(1, bottomIdx);
      wireframe.push(topIdx, bottomIdx);  // vertical
      wireframe.push(topIdx, nextTop);  // top horizontal
      wireframe.push(bottomIdx, nextBottom);  // bottom horizontal
      wireframe.push(topIdx, nextBottom); // diag
      if (i % 2 == 0) {   // we flip between starting at the top or bottom
        solid.push(topIdx, nextTop, nextBottom, bottomIdx, 1);
      } else {
        solid.push(bottomIdx, nextBottom, topIdx, nextTop, 0);
      }
    }

    return {
      vertices: verts,
      faces: [{mode: "TRIANGLE_STRIP", indices: solid}],
      wireframe: wireframe
    };
  }
}

