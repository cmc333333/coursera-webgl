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
  cone: Shapes.Cone(12),
  cylinder: Shapes.Cylinder(12),
  sphere: Shapes.Sphere(12),
  editing: null,
  render: function() {
    var transformLoc = this.gl.getUniformLocation(this.program, "transform"),
        transform = mult(translate(this.positionX(), this.positionY(), this.positionZ()),
                    mult(rotate(this.rotateX(), 1, 0, 0),
                    mult(rotate(this.rotateY(), 0, 1, 0),
                    mult(rotate(this.rotateZ(), 0, 0, 1),
                         scale(this.skewX(), this.skewY(), this.skewZ())))));
    this.editing = this.sphere;

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.uniformMatrix4fv(transformLoc, false, flatten(transform));
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.editing.vertices),
                       this.gl.STATIC_DRAW);
    
    if (this.wireframe()) {
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
                         new Uint8Array(this.editing.wireframe),
                         this.gl.STATIC_DRAW);
      this.gl.drawElements(this.gl.LINES, this.editing.wireframe.length,
                           this.gl.UNSIGNED_BYTE, 0);
    } else {
      for (var i = 0; i < this.editing.faces.length; i++) {
        var face = this.editing.faces[i];
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
                           new Uint8Array(face.indices),
                           this.gl.STATIC_DRAW);
        this.gl.drawElements(this.gl[face.mode], face.indices.length,
                             this.gl.UNSIGNED_BYTE, 0);
      }
    }
  },
  onTabClick: function(ev) {
    var $link = $(ev.target);
    $('.tab-body').hide();
    $('[data-tab-body=' + $link.data('tab') + ']').show();
    $('.tab').removeClass("current");
    $link.parent().addClass("current");
    ev.preventDefault();
    return false;
  }
}

$(function() {
  var $rotateX = $('#rotate_x'),
      $rotateY = $('#rotate_y'),
      $rotateZ = $('#rotate_z'),
      $positionX = $('#position_x'),
      $positionY = $('#position_y'),
      $positionZ = $('#position_z'),
      $scale = $('#scale'),
      $skewX = $('#skew_x'),
      $skewY = $('#skew_y'),
      $skewZ = $('#skew_z'),
      $wireframe = $('input[type=checkbox]');

  App.initGL();
  App.rotateX = function() { return $rotateX.val(); }
  App.rotateY = function() { return $rotateY.val(); }
  App.rotateZ = function() { return $rotateZ.val(); }
  App.wireframe = function() { return $wireframe.is(':checked'); }
  App.positionX = function() { return $positionX.val(); }
  App.positionY = function() { return $positionY.val(); }
  App.positionZ = function() { return $positionZ.val(); }
  App.skewX = function() { return $skewX.val(); }
  App.skewY = function() { return $skewY.val(); }
  App.skewZ = function() { return $skewZ.val(); }
  App.render();

  $rotateX.on("input change", App.render.bind(App));
  $rotateY.on("input change", App.render.bind(App));
  $rotateZ.on("input change", App.render.bind(App));
  $wireframe.on("input change", App.render.bind(App));
  $positionX.on("input change", App.render.bind(App));
  $positionY.on("input change", App.render.bind(App));
  $positionZ.on("input change", App.render.bind(App));
  $skewX.on("input change", App.render.bind(App));
  $skewY.on("input change", App.render.bind(App));
  $skewZ.on("input change", App.render.bind(App));
  $scale.on("input change", function() {
    var val = $scale.val();
    $skewX.val(val);
    $skewY.val(val);
    $skewZ.val(val);
    App.render();
  });
  $('.tab a').click(App.onTabClick.bind(App)).first().click();
});
