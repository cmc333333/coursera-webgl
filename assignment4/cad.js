var App = {
  initGL: function() {
    canvas = document.getElementById("gl-canvas");
    this.gl = WebGLUtils.setupWebGL(canvas);
    if (!this.gl) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    this.program = initShaders(this.gl, "vertex-shader", "fragment-shader");
    this.gl.useProgram(this.program);

    this.setupLocs();
    this.sendStaticData();
  },
  setupLocs: function() {
    this.locs.vNormal = this.gl.getAttribLocation(this.program, "vNormal");
    this.locs.vPosition = this.gl.getAttribLocation(this.program, "vPosition");
    this.locs.lightAmbient = this.gl.getUniformLocation(this.program, "lightAmbient");
    this.locs.lightDiffuse = this.gl.getUniformLocation(this.program, "lightDiffuse");
    this.locs.lightSpecular = this.gl.getUniformLocation(this.program, "lightSpecular");
    this.locs.materialColor = this.gl.getUniformLocation(this.program, "materialColor");
    this.locs.lightPosition = this.gl.getUniformLocation(this.program, "lightPosition");
    this.locs.shininess = this.gl.getUniformLocation(this.program, "shininess");
    this.locs.projectionMatrix = this.gl.getUniformLocation(this.program, "projectionMatrix");
    this.locs.modelViewMatrix = this.gl.getUniformLocation(this.program, "modelViewMatrix");
    this.locs.numLights = this.gl.getUniformLocation(this.program, "numLights");
  },
  sendNormals: function() {
    var normalsArray = App.shapes.cone.normals.concat(
                       App.shapes.cylinder.normals.concat(
                       App.shapes.sphere.normals));
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(normalsArray),
                       this.gl.STATIC_DRAW);
    
    this.gl.vertexAttribPointer(this.locs.vNormal, 3, this.gl.FLOAT, false, 0,
                                0);
    this.gl.enableVertexAttribArray(this.locs.vNormal);
  },
  sendPoints: function() {
    var pointsArray;
    this.shapes.cone.offset = 0;
    this.shapes.cylinder.offset = this.shapes.cone.size;
    this.shapes.sphere.offset = this.shapes.cone.size +
                                this.shapes.cylinder.size;

    pointsArray = this.shapes.cone.triangles.concat(
                  this.shapes.cylinder.triangles.concat(
                  this.shapes.sphere.triangles));
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(pointsArray),
                       this.gl.STATIC_DRAW);
    
    this.gl.vertexAttribPointer(this.locs.vPosition, 3, this.gl.FLOAT, false,
                                0, 0);
    this.gl.enableVertexAttribArray(this.locs.vPosition);
  },
  sendStaticData: function() {
    this.sendNormals();
    this.sendPoints();

    this.gl.uniform4fv(this.locs.lightDiffuse, vec4(1, 1, 1, 1));
    this.gl.uniform4fv(this.locs.lightSpecular, vec4(1, 1, 1, 1));
  },
  locs: {},
  shapes: {
    cone: Shapes.Cone(16),
    cylinder: Shapes.Cylinder(16),
    sphere: Shapes.Sphere(16)
  },
  models: [],
  current: function() {
    return {
      shape: this.shape(),
      shininess: this.shininess(),
      color: this.color(),
      mvMatrix:
        mult(translate(this.position()),
        mult(rotate(this.rotateX(), 1, 0, 0),
        mult(rotate(this.rotateY(), 0, 1, 0),
        mult(rotate(this.rotateZ(), 0, 0, 1),
             scale(this.scale())))))
    };
  },
  movements: {
    fixed: function(now) { return [0, 0, 0]; },
    xy: function(now) { return [Math.sin(now), Math.cos(now), 0]; },
    xz: function(now) { return [Math.sin(now), 0, Math.cos(now)]; },
    yz: function(now) { return [0, Math.sin(now), Math.cos(now)]; },
  },
  currentLight: function() {
    return {
      position: this.lightPosition(),
      movement: this.lightMovement()
    };
  },
  _lights: [],
  lights: function() {
    var now = new Date().getTime() / 500,
        light = this.currentLight(),
        lights = [add(light.position, this.movements[light.movement](now))];
    for (var i = 0; i < this._lights.length; i++) {
      light = this._lights[i];
      lights.push(add(light.position, this.movements[light.movement](now)));
    }
    return lights;
  },
  render: function() {
    var projection;
    this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    if (this.perspective()) {
      projection = mult(perspective(60, 1, .1, 10),
                        translate(0, 0, -3));
    } else {
      projection = ortho(-1, 1, -1, 1, -100, 100);
    }

    this.gl.uniformMatrix4fv(this.locs.projectionMatrix, false, flatten(projection));
            
    this.gl.uniform4fv(this.locs.lightAmbient, this.ambientColor());
    var lights = this.lights();
    this.gl.uniform1i(this.locs.numLights, lights.length);
    this.gl.uniform3fv(this.locs.lightPosition, flatten(lights));
    for (var i = 0; i < this.models.length; i++) {
      this.renderModel(this.models[i]);
    }
    for (i = 0; i < lights.length; i++) {
      var light = lights[i];
      this.renderModel({shape: "sphere",
                        shininess: 0,
                        color: [1, 1, 1, 1],
                        mvMatrix: mult(
                          translate(light[0], light[1], light[2]),
                          scale(0.25, 0.25, 0.25))});
    }
    this.renderModel(this.current());
    requestAnimFrame(App.render.bind(App));

  },
  renderModel: function(model) {
    var shape = this.shapes[model.shape];
    this.gl.uniformMatrix4fv(this.locs.modelViewMatrix, false, flatten(model.mvMatrix));
    this.gl.uniform1f(this.locs.shininess, model.shininess);
    this.gl.uniform4fv(this.locs.materialColor, model.color);
    this.gl.drawArrays(this.gl.TRIANGLES, shape.offset, shape.size);

  },
  placeModel: function() {
    this.models.push(this.current());
  },
  placeLight: function() {
    this._lights.push(this.currentLight());
  },
  exportData: function() {
    var json = JSON.stringify({models: this.models, lights: this._lights});
    window.open("data:application/json," + json);
  },
  loadData: function(file) {
    var reader = new FileReader();
    reader.onload = function() {
      var obj = JSON.parse(reader.result);
      for (var i = 0; i < obj.models.length; i++) {
        var model = obj.models[i];
        model.mvMatrix.matrix = true;
        App.models.push(model);
      }
      for (var i = 0; i < obj.lights.length; i++) {
        var light = obj.lights[i];
        App._lights.push(light);
      }
    };
    reader.readAsText(file);
  }
};

$(function() {
  var valOf = function(search) { return function() { return $(search).val(); };},
      $perspective = $('#perspective'),
      $colors = $('input.color'),
      $import = $('#import'),
      $export = $('#export');

  App.initGL();
  App.rotateX = valOf('#rotate_x');
  App.rotateY = valOf('#rotate_y');
  App.rotateZ = valOf('#rotate_z');
  App.position = function() {
    return [parseFloat($('#position_x').val()),
            parseFloat($('#position_y').val()),
            parseFloat($('#position_z').val())];
  };
  App.scale = function() {
    return [parseFloat($('#skew_x').val()),
            parseFloat($('#skew_y').val()),
            parseFloat($('#skew_z').val())];
  };
  App.shape = function() { return $('input[name=shape]:checked').val(); };
  App.lightMovement = function() { return $('input[name=movement]:checked').val(); };
  App.perspective = function() { return $perspective.is(':checked'); };
  App.color = function() {
    var $selected = $colors.filter('.selected'),
        colorStr = $selected.css('background-color').slice(4, -1),
        components = colorStr.split(', ');
    components.push(255);
    return $.map(components, function(v) { return parseInt(v)/255; });
  };
  App.ambientColor = function() {
    return vec4(
      parseInt($('#ambient_r').val())/255,
      parseInt($('#ambient_g').val())/255,
      parseInt($('#ambient_b').val())/255,
      1);
  };
  App.shininess = valOf('#shininess');
  App.lightPosition = function() {
    return [parseFloat($('#light_x').val()),
                parseFloat($('#light_y').val()),
                parseFloat($('#light_z').val())];
  };
  App.render();

  $('#place-model').click(App.placeModel.bind(App));
  $('#place-light').click(App.placeLight.bind(App));
  $colors.click(function() {
    $colors.removeClass('selected');
    $(this).addClass('selected');
    //App.render();
  });
  if (window.File && window.FileList && window.FileReader) {
    $export.click(App.exportData.bind(App));
    $import.change(function(ev) {
      App.loadData(ev.target.files[0]);
    });
  } else {
    $('[data-tab-body=import-export]').html(
      "<strong>Sorry, your browser does not support import/export");
  }
});
