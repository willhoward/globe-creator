import * as THREE from 'three';
import mapImageString from './map-image.js';

const renderGlobe = (
  canvas = null,
  antialias = true,
  cameraFOV = 90,
  cameraNear = 1,
  cameraFar = 2000,
  cameraX = 0,
  cameraY = 0,
  cameraZ = 999,
  dotCount = 60000,
  earthRadius = 600,
  landRadius = 600,
  earthWidthSegments = 48,
  earthHeightSegments = 48,
  landImage = mapImageString,
  backgroundColor = 0x001933,
  ambientLightColor = 0x004188,
  ambientLightIntensity = 0.3,
  earthColor = 0x1c1b25,
  earthOpacity = 0.8,
  sunColor = 0x0062cc,
  sunIntensity = 0.4,
  highlightColor = 0x004188,
  highlightIntensity = 0.2,
) => {
  // Define the scene constants
  const CANVAS = canvas;
  const ANTIALIAS = antialias;
  const CAMERA_FOV = cameraFOV;
  const CAMERA_NEAR = cameraNear;
  const CAMERA_FAR = cameraFar;
  const CAMERA_X = cameraX;
  const CAMERA_Y = cameraY;
  const CAMERA_Z = cameraZ;

  // Define the object constants
  const DOT_COUNT = dotCount;
  const EARTH_RADIUS = earthRadius;
  const LAND_RADIUS = landRadius;
  const EARTH_WIDTH_SEGMENTS = earthWidthSegments;
  const EARTH_HEIGHT_SEGMENTS = earthHeightSegments;
  const LAND_IMAGE = landImage;

  // Define the colors and light constants
  const BACKGROUND_COLOR = backgroundColor;
  const AMBIENT_LIGHT_COLOR = ambientLightColor;
  const AMBIENT_LIGHT_INTENSITY = ambientLightIntensity;
  const EARTH_COLOR = earthColor;
  const EARTH_OPACITY = earthOpacity;
  const SUN_COLOR = sunColor;
  const SUN_INTENSITY = sunIntensity;
  const HIGHLIGHT_COLOR = highlightColor;
  const HIGHLIGHT_INTENSITY = highlightIntensity;

  const vertexShader = `
    uniform float time;
    attribute float displacement;
    varying float vRndId;

    void main() {
      vRndId = displacement;

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `;

  const fragmentShader = `
    uniform float time;
    varying float vRndId;

    void main() {
      vec3 colorA = vec3(0,0.255,0.533);
      vec3 colorB = vec3(0,0.482,1);

      float multiplier = 1.0;

      float percentage = abs(sin(time * vRndId));

      vec3 color = vec3(0.0,0.0,0.0);

      color = mix(colorA,colorB,percentage);

      gl_FragColor = vec4(color,1.0);
    }
  `;

  // Utility function to convert a dot on a sphere into a UV point on a
  // rectangular texture or image.
  const pointToUV = (dotCenter, sphereCenter) => {
    // Create a new vector and give it a direction from the center of the sphere
    // to the center of the dot.
    const newVector = new THREE.Vector3();
    newVector.subVectors(sphereCenter, dotCenter).normalize();

    // Calculate the  UV coordinates of the dot and return them as a vector.
    const uvX = 1 - (0.5 + Math.atan2(newVector.z, newVector.x) / (2 * Math.PI));
    const uvY = 0.5 + Math.asin(newVector.y) / Math.PI;

    return new THREE.Vector2(uvX, uvY);
  };

  // Utility function to sample the data of an image at a given point. Requires
  // an imageData object.
  const sampleImage = (imageData, uv) => {
    // Calculate and return the data for the point, from the UV coordinates.
    const point = (
      4 * Math.floor(
        uv.x * imageData.width,
      ) + Math.floor(uv.y * imageData.height) * (4 * imageData.width)
    );

    return imageData.data.slice(point, point + 4);
  };

  // Render the globe scene.
  const renderScene = (imageData) => {
    // Define the renderer, in this case WebGL.
    const renderer = new THREE.WebGLRenderer({
      canvas: CANVAS,
      antialias: ANTIALIAS,
      alpha: true,
    });

    // // Set up and position the camera.
    const camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      CANVAS.width / CANVAS.height,
      CAMERA_NEAR,
      CAMERA_FAR,
    );

    camera.position.set(CAMERA_X, CAMERA_Y, CAMERA_Z);

    // Set up the scene.
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(BACKGROUND_COLOR);

    // Create the earth mesh from its geometry and material.
    const earthGeometry = new THREE.SphereBufferGeometry(
      EARTH_RADIUS,
      EARTH_WIDTH_SEGMENTS,
      EARTH_HEIGHT_SEGMENTS,
    );
    const earthMaterial = new THREE.MeshPhongMaterial({
      emissive: EARTH_COLOR,
      transparent: true,
      opacity: EARTH_OPACITY,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);

    earth.position.set(0, 0, 0);

    scene.add(earth);

    // Define constant arrays to hold the variables for each land dot.
    const dotVertexPositions = [];
    const dotRandomNumbers = [];

    // Create a blank vector to be used by the dots.
    const vector = new THREE.Vector3();

    // Iterate across the number of land dots required to cover the whole globe.
    for (let i = 0; i < DOT_COUNT; i += 1) {
      // Create a new geometry and vector for each dot.
      const dotGeometry = new THREE.CircleGeometry(2, 5);

      // Work out the spherical coordinates of each dot, in a phyllotaxis pattern.
      const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
      const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;

      // Set the dot vector from the spherical coordinates.
      vector.setFromSphericalCoords(LAND_RADIUS, phi, theta);

      // Set the dot geometry direction to be the intial direction it was created in
      // and move it into position. This will ensure it stays facing the center of
      // the globe when orbiting it.
      dotGeometry.lookAt(vector);
      dotGeometry.translate(vector.x, vector.y, vector.z);

      // Find the bounding sphere of the dot.
      dotGeometry.computeBoundingSphere();

      // Find the UV position of the dot on the land image.
      const uv = pointToUV(
        dotGeometry.boundingSphere.center,
        new THREE.Vector3(),
      );

      // Sample the pixel on the land image at the given UV position.
      const sampledPixel = sampleImage(imageData, uv);

      // If the pixel contains a color value (in other words, is not transparent),
      // continue to create the dot. Otherwise don't bother.
      if (sampledPixel[3]) {
        // Create a single random number, which is to be used as a variable
        // for all the dot geometry faces.
        const randomNumber = Math.random();

        // Iterate across the dot geometry faces, pushing the vertices for each
        // into the dotVertexPositions array, along with the randomNumber.
        dotGeometry.faces.forEach((face) => {
          dotVertexPositions.push(
            dotGeometry.vertices[face.a].x,
            dotGeometry.vertices[face.a].y,
            dotGeometry.vertices[face.a].z,
          );
          dotVertexPositions.push(
            dotGeometry.vertices[face.b].x,
            dotGeometry.vertices[face.b].y,
            dotGeometry.vertices[face.b].z,
          );
          dotVertexPositions.push(
            dotGeometry.vertices[face.c].x,
            dotGeometry.vertices[face.c].y,
            dotGeometry.vertices[face.c].z,
          );
          dotRandomNumbers.push(randomNumber, randomNumber, randomNumber);
        });
      }
    }

    // Create a buffer geometry to hold the land dots,
    // then assign the vertex positions and random numbers to it.
    const landGeometry = new THREE.BufferGeometry();

    landGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(dotVertexPositions, 3),
    );
    landGeometry.setAttribute(
      'displacement',
      new THREE.Float32BufferAttribute(dotRandomNumbers, 1),
    );

    // Define the uniforms to be passed to the vertex and fragment shaders.
    const uniforms = {
      time: { value: 0 },
      colorB: { type: 'vec3', value: new THREE.Color(0xf45f45) },
      colorA: { type: 'vec3', value: new THREE.Color(0xfefefe) },
    };

    // Create the land material, passing the vertex and fragment shader scripts.
    const landMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    });

    // Create the land mesh from its geometry and material.
    const land = new THREE.Mesh(landGeometry, landMaterial);

    // Set up and position the lights.
    const ambientLight = new THREE.AmbientLight(
      AMBIENT_LIGHT_COLOR,
      AMBIENT_LIGHT_INTENSITY,
    );
    const highlight = new THREE.PointLight(HIGHLIGHT_COLOR, HIGHLIGHT_INTENSITY);
    const sun = new THREE.PointLight(SUN_COLOR, SUN_INTENSITY);

    highlight.position.set(1200, 1200, 1200);
    sun.position.set(-1200, -1200, -100);

    // Add the objects and lights to the scene.
    scene.add(earth, land, ambientLight, highlight, sun);

    // Animate the scene using the browser's native requestAnimationFrame method.
    const animate = (time) => {
      // Reduce the current timestamp to something manageable.
      let tempTime = time;

      tempTime *= 0.001;

      // Update the shader uniforms and the land rotation.
      uniforms.time.value = tempTime;
      land.rotation.y = tempTime * 0.05;

      // Re-render the scene and trigger another animation frame.
      renderer.render(scene, camera);

      requestAnimationFrame(animate);
    };

    // Trigger the first animation frame.
    requestAnimationFrame(animate);
  };

  // Kick off the process to render the globe.
  const initialiseGlobe = () => {
    // Initialise an image loader.
    const imageLoader = new THREE.ImageLoader();

    // Load the image used to determine where land dots are displayed. The globe
    // cannot be initialised until this is complete.
    imageLoader.load(LAND_IMAGE, (image) => {
      // Create an HTML canvas, get its context and draw the image on it.
      const tempCanvas = document.createElement('canvas');

      tempCanvas.width = image.width;
      tempCanvas.height = image.height;

      const ctx = tempCanvas.getContext('2d');

      ctx.drawImage(image, 0, 0);

      // Read the image data from the canvas context.
      const imageData = ctx.getImageData(0, 0, image.width, image.height);

      // Call the function to render the globe scene, passing the land imageData.
      renderScene(imageData);
    });
  };

  initialiseGlobe();
};

export default renderGlobe;
