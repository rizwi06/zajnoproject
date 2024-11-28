import LocomotiveScroll from 'locomotive-scroll';
import gsap from 'gsap';
import * as THREE from 'three';
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';
const locomotiveScroll = new LocomotiveScroll();

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isDesktop = window.innerWidth >= 1024; // Assuming 1024px as the desktop breakpoint

if (!isMobile && isDesktop) {

  const scene = new THREE.Scene();
  const distance = 20;
  const fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI);
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas'),
    alpha: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const images = document.querySelectorAll('img');
  const planes = [];
  images.forEach(image => {
    const imgbounds = image.getBoundingClientRect();
    const texture = new THREE.TextureLoader().load(image.src);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 }
      },
      vertexShader,
      fragmentShader,
    });
    const geometry = new THREE.PlaneGeometry(imgbounds.width, imgbounds.height);
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(imgbounds.left - window.innerWidth / 2 + imgbounds.width / 2, -imgbounds.top + window.innerHeight / 2 - imgbounds.height / 2, 0);
    planes.push(plane);
    scene.add(plane);
  });

  camera.position.z = distance;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function updatePlanesPosition() {
    planes.forEach((plane, index) => {
      const image = images[index];
      const imgbounds = image.getBoundingClientRect();
      plane.position.set(imgbounds.left - window.innerWidth / 2 + imgbounds.width / 2, -imgbounds.top + window.innerHeight / 2 - imgbounds.height / 2, 0);
      plane.scale.set(imgbounds.width / plane.geometry.parameters.width, imgbounds.height / plane.geometry.parameters.height, 1);
    });
  }

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planes);

    planes.forEach(plane => {
      gsap.to(plane.material.uniforms.uHover, { value: 0, duration: 0.5 }); 
    });

    if (intersects.length > 0) {
      const intersectedPlane = intersects[0].object;
      gsap.to(intersectedPlane.material.uniforms.uMouse.value, { x: intersects[0].uv.x, y: intersects[0].uv.y, duration: 0.5 });
      gsap.to(intersectedPlane.material.uniforms.uHover, { value: 1, duration: 0.5 });
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    updatePlanesPosition();
    renderer.render(scene, camera);
  }

  animate();
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    updatePlanesPosition();
  });

  window.addEventListener('mousemove', onMouseMove);
}
else{
  document.getElementById('canvas').style.display = 'none';
  document.querySelectorAll('img').forEach(img => {
    img.style.opacity = 1;
  })
}