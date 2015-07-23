
var App = {
  strokeLengths: [],
  points: [],
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
  startStroke: function(x, y) {
    this.strokeLengths.unshift(0);
    this.addPoint(x, y);
  },
  addPoint: function(x, y) {
    this.points.push(vec2(x,y));
    this.strokeLengths[0]++;
  },
  stopStroke: function(x, y) {
    this.addPoint(x, y);
  },
  render: function() {
    var numProcessed = 0;
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.points),
                       this.gl.STATIC_DRAW);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    $.each(this.strokeLengths, function(_, strokeLength) {
      this.gl.drawArrays(this.gl.LINE_STRIP, numProcessed, strokeLength);
      numProcessed += strokeLength;
    }.bind(this));
  },
  sendAndRender: function() { 
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
  App.startStroke(0, 0);
  App.addPoint(0.5, 0);
  App.stopStroke(0.5, 0.5);

  App.startStroke(-0.5, 0);
  App.addPoint(-0.5, -0.5);
  App.stopStroke(0.0, 1.0);
  App.sendAndRender();

  $theta.change(App.sendAndRender.bind(App));
  $sub.change(App.sendAndRender.bind(App));
  $twist.change(App.sendAndRender.bind(App));
});
