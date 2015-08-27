var Shapes = {
  Sphere: function(numBasePoints) {
    var verts = [], texVerts = [],
        bottom = vec3(0, -1, 0),
        top = vec3(0, 1, 0),
        triangles = [], texCoords = [],
        phis = [],
        thetas = [],
        increment = 2 * Math.PI / numBasePoints,
        theta, phi, t, p;

    for (theta = 0; theta < 2 * Math.PI; theta += increment) {
      thetas.push(theta);
    }
    thetas.push(2*Math.PI);
    for (phi = 0; phi < Math.PI; phi += increment) {
      phis.push(phi);
    }
    phis.push(Math.PI);

    for (t = 0; t < thetas.length; t++) {
      theta = thetas[t];
      for (p = 0; p < phis.length; p++) {
        phi = phis[p];
        verts.push(vec3(Math.sin(phi)*Math.cos(theta),
                        Math.sin(phi)*Math.sin(theta),
                        Math.cos(phi)));
        texVerts.push(vec2(t/thetas.length, p/phis.length));
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
        texCoords.push(texVerts[urIdx], texVerts[llIdx], texVerts[lrIdx]);
        texCoords.push(texVerts[urIdx], texVerts[ulIdx], texVerts[llIdx]);
      }
    }

    return {
      triangles: triangles,
      normals: triangles,
      texCoords: texCoords,
      size: triangles.length
    };
  }
};
