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
        color = this.gl.getUniformLocation(this.program, "color");
        transform = mult(translate(this.positionX(), this.positionY(), this.positionZ()),
                    mult(rotate(this.rotateX(), 1, 0, 0),
                    mult(rotate(this.rotateY(), 0, 1, 0),
                    mult(rotate(this.rotateZ(), 0, 0, 1),
                         scale(this.skewX(), this.skewY(), this.skewZ())))));
    this.editing = this.sphere;
    this.gl.uniform4f(color, this.color()[0], this.color()[1], this.color()[2], 1);

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
  var valOf = function(search) { return function() { return $(search).val(); }},
      $scale = $('#scale'),
      $wireframe = $('input[type=checkbox]'),
      $colors = $('input.color');

  App.initGL();
  App.rotateX = valOf('#rotate_x');
  App.rotateY = valOf('#rotate_y');
  App.rotateZ = valOf('#rotate_z');
  App.positionX = valOf('#position_x');
  App.positionY = valOf('#position_y');
  App.positionZ = valOf('#position_z');
  App.skewX = valOf('#skew_x');
  App.skewY = valOf('#skew_y');
  App.skewZ = valOf('#skew_z');
  App.wireframe = function() { return $wireframe.is(':checked'); }
  App.color = function() {
    var $selected = $colors.filter('.selected'),
        colorStr = $selected.css('background-color').slice(4, -1),
        components = colorStr.split(', ');
    return $.map(components, function(v) { return parseInt(v)/255; });
  };
  App.render();

  $('input[type=range]').not($scale).on("input change", App.render.bind(App));
  $scale.on("input change", function() {
    var val = $scale.val();
    $('[data-tab-body=scale] input').val(val);
    App.render();
  });
  $wireframe.click(App.render.bind(App));
  $('.tab a').click(App.onTabClick.bind(App)).first().click();
  $colors.click(function() {
    $colors.removeClass('selected');
    $(this).addClass('selected');
    App.render();
  });
});
