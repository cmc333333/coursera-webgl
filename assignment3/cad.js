var Cone = function(numBasePoints) {
  var verts = [vec3(0, 0.5, 0)],
      wireframe = [];

  for (var i = 0; i < numBasePoints; i++) {
    var theta = 2 * Math.PI * i / numBasePoints;
    verts.push(vec3(Math.cos(theta)/4, 0, Math.sin(theta)/4));
    wireframe.push(0);
    wireframe.push(i+1);
    wireframe.push(i+1);
    wireframe.push(i+2);
  }
  wireframe[wireframe.length - 1] = 1;    // link the last bit of the circle

  return {
    vertices: verts,
    mode: "TRIANGLE_FAN",
    indices: _.range(numBasePoints + 1),
    wireframe: wireframe
  };
};

var App = {
  initGL: function() {
    canvas = document.getElementById("gl-canvas");
    this.gl = WebGLUtils.setupWebGL(canvas);
    if (!this.gl) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    this.program = initShaders(this.gl, "vertex-shader", "fragment-shader");
    this.gl.useProgram(this.program);

    // setup buffers
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.gl.createBuffer());

    var vPosition = this.gl.getAttribLocation(this.program, "vPosition");
    this.gl.vertexAttribPointer(vPosition, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vPosition);
  },
  cone: Cone(6),
  render: function() {
    var transformLoc = this.gl.getUniformLocation(this.program, "transform"),
        transform = mult(rotate(this.rotateX(), 1, 0, 0),
                    mult(rotate(this.rotateY(), 0, 1, 0),
                         rotate(this.rotateZ(), 0, 0, 1)));
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.uniformMatrix4fv(transformLoc, false, flatten(transform));
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.cone.vertices),
                       this.gl.STATIC_DRAW);
    
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.cone.wireframe),
                       this.gl.STATIC_DRAW);

    this.gl.drawElements(this.gl.LINES, this.cone.wireframe.length, this.gl.UNSIGNED_BYTE, 0);
  }
}

$(function() {
  var $rotateX = $('input[data-attr=rotate-x]'),
      $rotateY = $('input[data-attr=rotate-y]'),
      $rotateZ = $('input[data-attr=rotate-z]');

  App.initGL();
  App.rotateX = function() { return $rotateX.val(); }
  App.rotateY = function() { return $rotateY.val(); }
  App.rotateZ = function() { return $rotateZ.val(); }
  App.render();

  $rotateX.on("input change", App.render.bind(App));
  $rotateY.on("input change", App.render.bind(App));
  $rotateZ.on("input change", App.render.bind(App));
});
