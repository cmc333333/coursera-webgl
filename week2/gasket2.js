
var App = {
  dataLength: 0,
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

    var bufferId = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufferId);

    var vPosition = this.gl.getAttribLocation(this.program, "vPosition");
    this.gl.vertexAttribPointer(vPosition, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vPosition);
  },
  thetaInRadians: function() {
    return this.theta() * -2 * Math.PI / 360;
  },
  setTheta: function() {
    var theta = this.gl.getUniformLocation(this.program, "theta");
    this.gl.uniform1f(theta, this.thetaInRadians());
  },
  setTwist: function() {
    var twist = this.gl.getUniformLocation(this.program, "twist");
    this.gl.uniform1i(twist, this.twist() * 1);
  },
  recalcVertices: function() {
    var points = [],
        divideTriangle = function(a, b, c, count) {
          // base case
          if (count === 0) {
            points.push(a, b, c);
          } else {
              //bisect the sides
              var ab = mix(a, b, 0.5);
              var ac = mix(a, c, 0.5);
              var bc = mix(b, c, 0.5);
              // three new triangles
              divideTriangle(a, ab, ac, count - 1);
              divideTriangle(c, ac, bc, count - 1);
              divideTriangle(b, bc, ab, count - 1);
          }
        };

    divideTriangle(vec2(-1, -1), vec2(0, 1), vec2(1, -1), this.subdivisions());
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(points),
                       this.gl.STATIC_DRAW );
    this.dataLength = points.length;
  },
  render: function() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.dataLength);
  },
  sendAndRender: function() { 
    this.recalcVertices();
    this.setTheta();
    this.setTwist();
    this.render(); 
  }
}

$(function() {
  var $theta = $('#theta'),
      $sub = $('#subdivisions'),
      $twist = $('#twist');
  App.initGL();
  App.theta = function() { return parseFloat($theta.val()); };
  App.subdivisions = function() { return parseInt($sub.val()); };
  App.twist = function() { return $twist.is(':checked'); };
  App.sendAndRender();

  $theta.change(App.sendAndRender.bind(App));
  $sub.change(App.sendAndRender.bind(App));
  $twist.change(App.sendAndRender.bind(App));
});
