# globe-creator

Create beautiful WebGL globes using ThreeJS.

## Getting Started

1. Install this package using `npm i globe-creator` or `yarn add globe-creator`.
2. Create a canvas element. If you're using React, you'll want to give the canvas element a Ref.
3. Initialise `globe-creator` and pass your canvas element to it. if you're using React, you'll need to pass in the Ref you created in the previous step.

## Example

```
import React, { useRef } from 'react';
import createGlobe from 'globe-creator';

const MyComponent = () => {
	const myCanvas = useRef(null);

	useEffect(() => {
    createGlobe({ canvas: myCanvas.current });
  }, []);

	return (
		<canvas ref={myCanvas} width={600} height={600} />
	);
};

export default MyComponent;
```

## Available Options

You can pass the following options as function parameters to `globe-crator`:

* *canvas* _(required, format: element, default: null)_: The `canvas` element on which to render the globe. Make sure your `canvas` has a `width` and `height`.
* *antialias* _(optional, format: boolean, default: true)_: Whether or not to apply antialias smoothing to the globe. Disabling can improve device performance, but reduce render quality.
* *cameraFOV* _(optional, format: integer, default: 90)_: The camera's field of view.
* *cameraNear* _(optional, format: integer, default: 1)_: The camera's near field of view limit.
* *cameraFar* _(optional, format: integer, default: 2000)_: The camera's far field of view limit.
* *cameraX* _(optional, format: integer, default: 0)_: The camera's position on the X axis, where 0 is centered.
* *cameraY* _(optional, format: integer, default: 0)_: The camera's position on the Y axis, where 0 is centered.
* *cameraZ* _(optional, format: integer, default: 999)_: The camera's position on the Y axis, where 0 is centered.
* *dotCount* _(optional, format: integer, default: 60000)_: The total amount of dots to render on the surface of the globe, before any image masking is applied. Higher numbers may impact performance.
* *earthRadius* _(optional, format: integer, default: 600)_: The radius of the earth.
* *landRadius* _(optional, format: integer, default: 600)_: The radius of the land dot layer.
* *earthWidthSegments* _(optional, format: integer, default: 48)_: The number of width segments used to render the earth. Higher numbers will result in a smoother-looking sphere but may impact performance.
* *earthHeightSegments* _(optional, format: integer, default: 48)_: The number of height segments used to render the earth. Higher numbers will result in a smoother-looking sphere but may impact performance.
* *landImage* _(optional, format: PNG image, passed directly or as a base64 string, default: base 64 string image of continent land masses)_: The image used to mask the land dots and create shapes on the surface of the earth. By default the dots are masked using an image of the continent land masses. This must be a PNG image including transparency, passed directly or as a base64 string.
* *backgroundColor* _(optional, format: Threejs Vec3 color, default: 0x001933)_: The background color of the scene.
* *ambientLightColor* _(optional, format: Threejs Vec3 color, default: 0x004188)_: The ambient light color of the scene. This light affects the earth, but does not affect the land dot layer.
* *ambientLightIntensity* _(optional, format: float, default: 0.3)_: The intensity of the ambient light.
* *earthColor* _(optional, format: Threejs Vec3 color, default: 0x1c1b25)_: The color of the earth.
* *earthOpacity* _(optional, format: float, default: 0.8)_: The opacity of the earth.
* *sunColor* _(optional, format: Threejs Vec3 color, default: 0x0062cc)_: The color of the sun light, which is visible towards the bottom left of the globe. This light affects the earth, but does not affect the land dot layer.
* *sunIntensity* _(optional, format: float, default: 0.4)_: The intensity of the sun light.
* *highlightColor* _(optional, format: Threejs Vec3 color, default: 0x004188)_: The color of the highlight light, which is visible towards the top right of the globe. This light affects the earth, but does not affect the land dot layer.
* *highlightIntensity* _(optional, format: float, default: 0.2)_: The color of the highlight light.
