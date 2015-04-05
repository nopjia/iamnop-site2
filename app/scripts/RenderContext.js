"use strict";

var RenderContext = function(canvas) {

  // PRIVATE VARS

  var _this = this;

  var _canvas = canvas;
  var _renderer, _scene, _camera;
  var _w, _h, _aspect;

  var _lastTime = Date.now();

  var _meshes, _geo, _matLine, _matFill, _bbox;

  var _color = 0xffffff;
  var _bgcolor = 0x0;


  // PRIVATE FUNCTIONS

  var _initRenderer = function() {
    _renderer = new THREE.WebGLRenderer({
      canvas: _canvas,
      alpha: false,
      depth: true,
      stencil: false,
      antialias: false,
    });
    _renderer.setSize(_w, _h);
    _renderer.setClearColor(_bgcolor);
    _renderer.autoClear = false;
  };

  var _init = function() {
    _w = _canvas.clientWidth;
    _h = _canvas.clientHeight;
    _aspect = _w/_h;

    _initRenderer();

    // fov, aspect, near, far
    _camera = new THREE.PerspectiveCamera(45, _aspect, 1, 100);

    _scene = new THREE.Scene();

    window.addEventListener("resize", _onResize, false);

    _this.customInit();
  };

  var _onResize = function() {
    _w = _canvas.parentNode.clientWidth;
    _h = _canvas.parentNode.clientHeight;
    _aspect = _w/_h;

    _renderer.setSize(_w, _h);

    _camera.aspect = _aspect;
    _camera.updateProjectionMatrix();
  };

  var _calcDeltaTime = function() {
    var currTime = Date.now();
    var dt = 0.001 * ( currTime - _lastTime );
    _lastTime = currTime;
    return dt;
  };


  // PUBLIC FUNCTIONS

  this.update = function() {
    _renderer.clearTarget(null);

    var dt = _calcDeltaTime();
    this.customUpdate(dt);

    _renderer.render(_scene, _camera);
  };

  this.getRenderer = function() {
    return _renderer;
  };

  this.getScene = function() {
    return _scene;
  };

  this.getCamera = function() {
    return _camera;
  };

  this.setColors = function(color, bgcolor) {
    _matLine.color.set(color);
    _matFill.color.set(bgcolor);
    _renderer.setClearColor(bgcolor);
    _scene.fog.color.set(bgcolor);

    // sync, but not really used
    _color = color;
    _bgcolor = bgcolor;
  };

  this.customInit = function() {
    _camera.position.z = 10;

    // init common geo and mats
    _geo = new THREE.IcosahedronGeometry(1);
    _matLine = new THREE.MeshBasicMaterial({
      color: _color,
      wireframe: true
    });
    _matFill = new THREE.MeshBasicMaterial({
      color: _bgcolor,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: 1.0
    });

    // init bbox
    var BBOX_Z_OFFSET = 1.0;  // distance from camera near plane
    _bbox = new THREE.Box3(
      new THREE.Vector3(-10, -12, -10),
      new THREE.Vector3( 10,  12, _camera.position.z - _camera.near - BBOX_Z_OFFSET)
    );
    // // debug box
    // var bboxMesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), _matLine);
    // bboxMesh.position.copy(_bbox.center());
    // bboxMesh.scale.copy(_bbox.size());
    // _scene.add(bboxMesh);

    // fog
    var FOG_NEAR = 20.0;  // tweak overall fade amount
    _scene.fog = new THREE.Fog(_bgcolor, -FOG_NEAR, _camera.near + _bbox.size().z + FOG_NEAR/5.0);

    // init meshes
    var MESH_COUNT = 20;
    _meshes = [];
    for (var i=0; i<MESH_COUNT; i++) {
      var meshLine = new THREE.Mesh(_geo, _matLine);
      var meshFill = new THREE.Mesh(_geo, _matFill);

      var size = _bbox.size();
      var randPos = new THREE.Vector3(
        size.x*Math.random()+_bbox.min.x,
        size.y*Math.random()+_bbox.min.y,
        size.z*Math.random()+_bbox.min.z);
      meshLine.position.copy(randPos);
      meshFill.position.copy(randPos);

      var AVEL_RANGE = 1.0;
      var randAVel = [ AVEL_RANGE*Math.random()-AVEL_RANGE/2.0,
                      AVEL_RANGE*Math.random()-AVEL_RANGE/2.0,
                      AVEL_RANGE*Math.random()-AVEL_RANGE/2.0];
      meshLine.avel = meshFill.avel = randAVel;

      var VEL_RANGE = 1.0;
      var randVel = [ VEL_RANGE*Math.random()-VEL_RANGE/2.0,
                      VEL_RANGE*Math.random()-VEL_RANGE/2.0,
                      VEL_RANGE*Math.random()-VEL_RANGE/2.0];
      meshLine.vel = meshFill.vel = randVel;

      _meshes.push(meshLine);
      _meshes.push(meshFill);
      _scene.add(meshLine);
      _scene.add(meshFill);
    }
  };

  this.customUpdate = function(dt) {
    // update meshes anim
    for (var i=0; i<_meshes.length; i++) {
      _meshes[i].rotation.x += _meshes[i].avel[0] * dt;
      _meshes[i].rotation.y += _meshes[i].avel[1] * dt;
      _meshes[i].rotation.z += _meshes[i].avel[2] * dt;

      _meshes[i].position.x += _meshes[i].vel[0] * dt;
      _meshes[i].position.y += _meshes[i].vel[1] * dt;
      _meshes[i].position.z += _meshes[i].vel[2] * dt;
    }

    // check mesh wrap
    for (i=0; i<_meshes.length; i+=2) {
      if (!_bbox.containsPoint(_meshes[i].position)) {
        var mesh1 = _meshes[i];
        var mesh2 = _meshes[i+1];

        if      (mesh1.position.x > _bbox.max.x) mesh1.position.x = mesh2.position.x = _bbox.min.x;
        else if (mesh1.position.x < _bbox.min.x) mesh1.position.x = mesh2.position.x = _bbox.max.x;
        if      (mesh1.position.y > _bbox.max.y) mesh1.position.y = mesh2.position.y = _bbox.min.y;
        else if (mesh1.position.y < _bbox.min.y) mesh1.position.y = mesh2.position.y = _bbox.max.y;
        if      (mesh1.position.z > _bbox.max.z) mesh1.position.z = mesh2.position.z = _bbox.min.z;
        else if (mesh1.position.z < _bbox.min.z) mesh1.position.z = mesh2.position.z = _bbox.max.z;
      }
    }

    // update camera
    var RANGE = 20;
    var totalHeight = document.documentElement.scrollHeight;
    var currHeight = window.pageYOffset + window.innerHeight/2;
    _camera.position.y = -(currHeight/totalHeight * RANGE - RANGE/2.0);
  };


  _init();

};

RenderContext.prototype.constructor = RenderContext;