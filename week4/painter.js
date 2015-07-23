
var App = {
  strokes: [],
  currentStroke: null,
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
    this.currentStroke = {
      points: []
    };
    this.strokes.push(this.currentStroke);
    this.addPoint(x, y);
    this.render();
  },
  addPoint: function(x, y) {
    if (this.currentStroke) {
      this.currentStroke.points.push(vec2(x, y));
      this.render();
    }
  },
  stopStroke: function(x, y) {
    this.addPoint(x, y);
    this.currentStroke = null
    this.render();
  },
  render: function() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    for (var i = 0, len = this.strokes.length; i < len; i++) {
      var stroke = this.strokes[i];
      this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(stroke.points),
                         this.gl.STATIC_DRAW);
      this.gl.drawArrays(this.gl.LINE_STRIP, 0, stroke.points.length);
    }
  }
}

$(function() {
  var $canvas = $('canvas'),
      sendMouseTo = function(fn) {
        return function(ev) {
          var offset = $canvas.offset(),
              height = $canvas.height(),
              width = $canvas.width(),
              x = ev.pageX - offset.left,
              y = ev.pageY - offset.top;
          fn(-1 + 2*x/width, -1 + 2*(height - y)/height);
        };
      };
  App.initGL();
  App.render();

  $canvas.mousedown(sendMouseTo(App.startStroke.bind(App)));
  $canvas.mousemove(sendMouseTo(App.addPoint.bind(App)));
  $canvas.mouseup(sendMouseTo(App.stopStroke.bind(App)));
});
