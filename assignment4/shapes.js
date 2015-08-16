var Shapes = {
  Cone: function(numBasePoints) {
    var verts = [],
        top = vec3(0, 0.25, 0),
        bottom = vec3(0, -0.25, 0),
        triangles = [],
        normals = [],
        thetas = [],
        increment = 2 * Math.PI / numBasePoints,
        t;

    for (var theta = 0; theta < 2 * Math.PI; theta += increment) {
      thetas.push(theta);
    }

    for (t = 0; t < thetas.length; t++) {
      theta = thetas[t];
      verts.push(vec3(Math.cos(theta)/4, -0.25, Math.sin(theta)/4));
    }

    for (t = 1; t < thetas.length; t++) {
      triangles.push(verts[t], top, verts[t-1]);
      normals.push(vec3(verts[t][0] * 2, 0.25, verts[t][2] * 2),
                   top,
                   vec3(verts[t-1][0] * 2, 0.25, verts[t-1][2] * 2));
      triangles.push(verts[t-1], bottom, verts[t]);
      normals.push(vec3(0, -0.25, 0), vec3(0, -0.25, 0), vec3(0, -0.25, 0));
    }

    return {
      triangles: triangles,
      normals: normals
    };
  },
  Cylinder: function(numBasePoints) {
    var verts = [],
        bottom = vec3(0, -0.25, 0),
        top = vec3(0, 0.25, 0),
        triangles = [],
        normals = [],
        thetas = [],
        increment = 2 * Math.PI / numBasePoints,
        t;

    for (var theta = 0; theta < 2 * Math.PI; theta += increment) {
      thetas.push(theta);
    }

    for (t = 0; t < thetas.length; t++) {
      theta = thetas[t];
      verts.push(vec3(Math.cos(theta)/4, -0.25, Math.sin(theta)/4),
                 vec3(Math.cos(theta)/4, 0.25, Math.sin(theta)/4));
    }

    for (t = 1; t < thetas.length; t++) {
      var llIdx = 2*t,
          ulIdx = llIdx + 1,
          lrIdx = llIdx - 2,
          urIdx = llIdx - 1;
      triangles.push(verts[urIdx], verts[llIdx], verts[lrIdx]);
      normals.push(vec3(verts[urIdx][0], 0, verts[urIdx][2]),
                   vec3(verts[llIdx][0], 0, verts[llIdx][2]),
                   vec3(verts[lrIdx][0], 0, verts[lrIdx][2]));
      triangles.push(verts[urIdx], verts[ulIdx], verts[llIdx]);
      normals.push(vec3(verts[urIdx][0], 0, verts[urIdx][2]),
                   vec3(verts[ulIdx][0], 0, verts[ulIdx][2]),
                   vec3(verts[llIdx][0], 0, verts[llIdx][2]));
      triangles.push(bottom, verts[lrIdx], verts[llIdx]);
      normals.push(vec3(0, -0.25, 0), vec3(0, -0.25, 0), vec3(0, -0.25, 0));
      triangles.push(top, verts[ulIdx], verts[urIdx]);
      normals.push(vec3(0, 0.25, 0), vec3(0, 0.25, 0), vec3(0, 0.25, 0));
    }

    return {
      triangles: triangles,
      normals: normals
    };
  },
  Sphere: function(numBasePoints) {
    var verts = [],
        bottom = vec3(0, -1/4, 0),
        top = vec3(0, 1/4, 0),
        triangles = [],
        phis = [],
        thetas = [],
        increment = 2 * Math.PI / numBasePoints,
        theta, phi, t, p;

    for (theta = 0; theta < 2 * Math.PI; theta += increment) {
      thetas.push(theta);
    }
    for (phi = 0; phi < Math.PI; phi += increment) {
      phis.push(phi);
    }
    phis.push(Math.PI);

    for (t = 0; t < thetas.length; t++) {
      theta = thetas[t];
      for (p = 0; p < phis.length; p++) {
        phi = phis[p];
        verts.push(vec3(Math.sin(phi)*Math.cos(theta) / 4,
                        Math.sin(phi)*Math.sin(theta) / 4,
                        Math.cos(phi) / 4));
      }
    }
    // strips
    for (t=1; t < thetas.length; t++) {
      var colIdx = t*phis.length,
          lastColIdx = colIdx - phis.length;
      for (p=1; p < phis.length; p++) {
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
};
