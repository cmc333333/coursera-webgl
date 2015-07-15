
var App = {
  points: [],
  init: function() {
    canvas = document.getElementById("gl-canvas");
    this.gl = WebGLUtils.setupWebGL(canvas);
    if (!this.gl) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    this.program = initShaders(this.gl, "vertex-shader", "fragment-shader");
    this.gl.useProgram(this.program);
  },
  sendPoints: function() {
    var bufferId = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferId);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.points),
                       this.gl.STATIC_DRAW );
  },
  setTheta: function(value) {
    var theta = this.gl.getUniformLocation(this.program, "theta");
    this.gl.uniform1f(theta, value);
  },
  setVPosition: function() {
    var vPosition = this.gl.getAttribLocation(this.program, "vPosition");
    this.gl.vertexAttribPointer(vPosition, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vPosition);
  },
  recalcVertices: function(numDivisions) {
    this.points = [];
    this.divideTriangle(vec2(-1, -1), vec2(0, 1), vec2(1, -1), numDivisions);
  },
  divideTriangle: function(a, b, c, count) {
    // base case
    if (count === 0) {
      this.points.push(a, b, c);
    } else {
        //bisect the sides
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        // three new triangles
        this.divideTriangle(a, ab, ac, count);
        this.divideTriangle(c, ac, bc, count);
        this.divideTriangle(b, bc, ab, count);
    }
  },
  render: function() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.points.length);
  }
}

$(function() {
  App.init();
  App.recalcVertices(5);
  App.sendPoints();
  App.setVPosition();
  App.setTheta(0.0);
  App.render();
  $('#theta').knob({
    release: function(value) {
      App.setTheta(value * Math.PI / -50);
      App.render();
    }
  });
});
