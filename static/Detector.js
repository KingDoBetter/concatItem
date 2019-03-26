const Detector = {
	canvas : !! window.CanvasRenderingContext2D,
	webgl : ( function () { try { return !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )(),
	workers : !! window.Worker,
	fileapi : window.File && window.FileReader && window.FileList && window.Blob,

	getWebGLErrorMessage : function () {
		let domElement = document.createElement( 'div' );
		domElement.style.fontFamily = 'monospace';
		domElement.style.fontSize = '13px';
		domElement.style.textAlign = 'center';
		domElement.style.background = '#eee';
		domElement.style.color = '#000';
		domElement.style.padding = '1em';
		domElement.style.width = '475px';
		domElement.style.margin = '5em auto 0';
		if ( ! this.webgl ) {
			domElement.innerHTML = '你的浏览器不支持！'
		}
		return domElement;
	},
	addGetWebGLMessage : function ( parameters ) {
		var parent, id, domElement;
		parameters = parameters || {};
		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';
		domElement = Detector.getWebGLErrorMessage();
		domElement.id = id;
		parent.appendChild( domElement );
	}

};
const s = document.createElement('script');
s.type = 'x-shader/x-vertex';
s.setAttribute('id','vs');
s.innerText='varying vec2 vUv;\n' +
  '\t\t\tvoid main() {\n' +
  '\t\t\t\tvUv = uv;\n' +
  '\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
  '\t\t\t}';
document.body.appendChild(s);

const ss = document.createElement('script');
ss.type = 'x-shader/x-fragment';
ss.setAttribute('id','fs');
ss.innerText='uniform sampler2D map;\n' +
  '\t\t\tuniform vec3 fogColor;\n' +
  '\t\t\tuniform float fogNear;\n' +
  '\t\t\tuniform float fogFar;\n' +
  '\t\t\tvarying vec2 vUv;\n' +
  '\t\t\tvoid main() {\n' +
  '\t\t\t\tfloat depth = gl_FragCoord.z / gl_FragCoord.w;\n' +
  '\t\t\t\tfloat fogFactor = smoothstep( fogNear, fogFar, depth );\n' +
  '\t\t\t\tgl_FragColor = texture2D( map, vUv );\n' +
  '\t\t\t\tgl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );\n' +
  '\t\t\t\tgl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );\n' +
  '\t\t\t}';
document.body.appendChild(ss);

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;
var camera, scene, renderer;
var mesh, geometry, material;

var mouseX = 0, mouseY = 0;
var start_time = Date.now();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();

function init() {

  container = document.createElement( 'div' );
  container.style.width = '100%';
  container.style.height = '100%';
  container.setAttribute('id','canBox')
  container.style.overflow = 'hidden';
  container.style.backgroundImage='-webkit-gradient(linear, left top, left bottom, from(#3A7CEC), to(#79c4ff))'
  container.style.backgroundImage='-webkit-linear-gradient(top, #3A7CEC, #79c4ff)'
  container.style.backgroundImage='linear-gradient(to bottom, #3A7CEC, #79c4ff)'
  document.body.appendChild( container );


  camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.z = 6000;

  scene = new THREE.Scene();

  geometry = new THREE.Geometry();

  var texture = THREE.ImageUtils.loadTexture( 'http://bmob-cdn-24377.b0.upaiyun.com/2019/03/26/2caf78e8408c5fe880bba544020ea660.png', null, animate );
  texture.magFilter = THREE.LinearMipMapLinearFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;

  var fog = new THREE.Fog( 0x4584b4, - 100, 3000 );

  material = new THREE.ShaderMaterial( {

    uniforms: {

      "map": { type: "t", value: texture },
      "fogColor" : { type: "c", value: fog.color },
      "fogNear" : { type: "f", value: fog.near },
      "fogFar" : { type: "f", value: fog.far },

    },
    vertexShader: document.getElementById( 'vs' ).textContent,
    fragmentShader: document.getElementById( 'fs' ).textContent,
    depthWrite: false,
    depthTest: false,
    transparent: true

  } );

  var plane = new THREE.Mesh( new THREE.PlaneGeometry( 64, 64 ) );

  for ( var i = 0; i < 8000; i++ ) {

    plane.position.x = Math.random() * 1000 - 500;
    plane.position.y = - Math.random() * Math.random() * 200 - 15;
    plane.position.z = i;
    plane.rotation.z = Math.random() * Math.PI;
    plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5;

    THREE.GeometryUtils.merge( geometry, plane );

  }

  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  mesh = new THREE.Mesh( geometry, material );
  mesh.position.z = - 8000;
  scene.add( mesh );

  renderer = new THREE.WebGLRenderer( { antialias: false } );
  renderer.setSize( window.innerWidth , window.innerHeight );
   container.appendChild( renderer.domElement );

  // document.addEventListener( 'click', onDocumentMouseMove, false );
   window.addEventListener( 'orientationchange', onWindowResize, false );
}

// function onDocumentMouseMove( event ) {
// 	mouseX = ( event.clientX - windowHalfX ) * 0.25;
// 	mouseY = ( event.clientY - windowHalfY ) * 0.25;
// }
//
function onWindowResize( event ) {
	location.reload()
}

function animate() {
  requestAnimationFrame( animate );
  position = ( ( Date.now() - start_time ) * 0.03 ) % 8000;
  camera.position.x += ( mouseX - camera.position.x ) * 0.01;
  camera.position.y += ( - mouseY - camera.position.y ) * 0.01;
  camera.position.z = - position + 8000;
  renderer.render( scene, camera );
}
