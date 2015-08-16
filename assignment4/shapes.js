var Shapes = {
  // Convert a triangle strip representation to a lines representation
  strip2lines: function(stripIndices) {
    var lines = [stripIndices[0], stripIndices[1]];
    for (var i = 2; i < stripIndices.length; i++) {
      lines.push(stripIndices[i-2], stripIndices[i]);
      lines.push(stripIndices[i-1], stripIndices[i]);
    }
    return lines;
  },
  // Convert a triangle fan representation to a lines representation
  fan2lines: function(fanIndices) {
    var lines = [fanIndices[0], fanIndices[1]];
    for (var i = 2; i < fanIndices.length; i++) {
      lines.push(fanIndices[i-1], fanIndices[i]);
      lines.push(fanIndices[i], fanIndices[0]);
    }
    return lines;
  },
  Cone: function(numBasePoints) {
    var verts = [],
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
      coneIndices.push(idx);
      baseIndices.push(idx);
    }

    // wrap around the base
    coneIndices.push(2);
    baseIndices.push(2);

    return {
      vertices: verts,
      faces: [{mode: "TRIANGLE_FAN", indices: coneIndices},
              {mode: "TRIANGLE_FAN", indices: baseIndices}],
      wireframe: [].concat(this.fan2lines(coneIndices))
                   .concat(this.fan2lines(baseIndices))
    };
  },
  Cylinder: function(numBasePoints) {
    var verts = [],
        topFace = [],
        bottomFace = [],
        middle = [];

    // center point in both bases
    verts.push(vec3(0, 0.25, 0), vec3(0, -0.25, 0));
    topFace.push(0);
    bottomFace.push(1);

    for (var i = 0; i < numBasePoints; i++) {
      var theta = 2 * Math.PI * i / numBasePoints,
          topIdx = 2*i + 2,
          bottomIdx = topIdx + 1;

      verts.push(vec3(Math.cos(theta)/4, 0.25, Math.sin(theta)/4));
      verts.push(vec3(Math.cos(theta)/4, -0.25, Math.sin(theta)/4));

      topFace.push(topIdx);
      bottomFace.push(bottomIdx);
      middle.push(bottomIdx, topIdx);
    }

    // Wrap around
    topFace.push(2);
    bottomFace.push(3);
    middle.push(3, 2);

    return {
      vertices: verts,
      faces: [{mode: "TRIANGLE_FAN", indices: topFace},
              {mode: "TRIANGLE_FAN", indices: bottomFace},
              {mode: "TRIANGLE_STRIP", indices: middle}],
      wireframe: [].concat(this.fan2lines(topFace))
                   .concat(this.fan2lines(bottomFace))
                   .concat(this.strip2lines(middle))
    };
  },
  Sphere: function(numBasePoints) {
    var verts = [],
        bottom = vec3(0, -1/4, 0),
        top = vec3(0, 1/4, 0),
        triangles = [],
        phis = [],
        thetas = [],
        increment = 2 * Math.PI / numBasePoints;

    for (var theta = 0; theta < 2 * Math.PI; theta += increment) {
      thetas.push(theta);
    }
    for (var phi = 0; phi < Math.PI; phi += increment) {
      phis.push(phi);
    }
    phis.push(Math.PI);

    for (var t = 0; t < thetas.length; t++) {
      var theta = thetas[t];
      for (var p = 0; p < phis.length; p++) {
        var phi = phis[p];
        verts.push(vec3(Math.sin(phi)*Math.cos(theta) / 4,
                        Math.sin(phi)*Math.sin(theta) / 4,
                        Math.cos(phi) / 4));
      }
    }
    // strips
    for (var t=1; t < thetas.length; t++) {
      var colIdx = t*phis.length,
          lastColIdx = colIdx - phis.length;
      for (var p=1; p < phis.length; p++) {
        var urIdx = colIdx + p,
            lrIdx = urIdx - 1,
            ulIdx = lastColIdx + p,
            llIdx = ulIdx - 1;
            
        triangles.push(verts[urIdx], verts[llIdx], verts[lrIdx]);
        triangles.push(verts[urIdx], verts[ulIdx], verts[llIdx]);
      }
    }

    return {
      triangles: triangles,
      normals: triangles
    };
  }
}
