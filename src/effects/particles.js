/* Task 3 (enhanced): Three.js Background Particle System */
import { config } from '../utils/config.js';
import { store } from '../state/store.js';
import * as THREE from 'three';

class ParticleBackground {
  #scene = null;
  #camera = null;
  #renderer = null;
  #points = null;
  #graphGroup = null;
  #raf = null;
  #nodeMat = null;
  #edgeMat = null;
  #pm = null;
  #gp = null;

  #isLowPerf() {
    return window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;
  }

  init() {
    if (!config.features.particles || this.#isLowPerf()) return;
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    try {
      this.#scene = new THREE.Scene();
      this.#camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
      this.#camera.position.z = 60;
      this.#renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      this.#renderer.setSize(window.innerWidth, window.innerHeight);
      this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.#createParticles();
      this.#createGraph();
      this.#addLights();
      this.#bindMouse();
      this.#animate();
    } catch (e) { /* silent */ }
  }

  #createParticles() {
    this.#gp = new THREE.BufferGeometry();
    const pc = 2000;
    const pos = new Float32Array(pc * 3);
    const sizes = new Float32Array(pc);
    for (let i = 0; i < pc; i++) {
      const r = 50 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = Math.random() * 2 + 0.5;
    }
    this.#gp.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.#gp.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    this.#pm = new THREE.PointsMaterial({
      color: 0xA31F34, size: 0.25, transparent: true,
      opacity: 0.4, blending: THREE.AdditiveBlending,
    });
    this.#points = new THREE.Points(this.#gp, this.#pm);
    this.#scene.add(this.#points);
  }

  #createGraph() {
    this.#graphGroup = new THREE.Group();
    const nodes = [];
    const gn = 50;
    this.#nodeMat = new THREE.MeshBasicMaterial({ color: 0xB83A3A, transparent: true, opacity: 0.5 });
    this.#edgeMat = new THREE.LineBasicMaterial({ color: 0x6B1618, transparent: true, opacity: 0.08 });

    for (let i = 0; i < gn; i++) {
      const r = 18 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const v = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
      nodes.push(v);
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.18, 6, 6), this.#nodeMat);
      sphere.position.copy(v);
      this.#graphGroup.add(sphere);
    }

    for (let i = 0; i < gn; i++) {
      for (let j = i + 1; j < gn; j++) {
        const d = nodes[i].distanceTo(nodes[j]);
        if (d < 9) {
          const g = new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]]);
          this.#graphGroup.add(new THREE.Line(g, this.#edgeMat));
        }
      }
    }
    this.#scene.add(this.#graphGroup);
  }

  #addLights() {
    const al = new THREE.AmbientLight(0x2A0808, 0.3);
    this.#scene.add(al);
    const dl = new THREE.DirectionalLight(0xA31F34, 0.5);
    dl.position.set(10, 20, 10);
    this.#scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0x6B1618, 0.3);
    dl2.position.set(-10, -10, -10);
    this.#scene.add(dl2);
  }

  #bindMouse() {
    let mx = 0, my = 0;
    this._mouseHandler = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    document.addEventListener('mousemove', this._mouseHandler);

    this._resizeHandler = () => {
      this.#camera.aspect = window.innerWidth / window.innerHeight;
      this.#camera.updateProjectionMatrix();
      this.#renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this._resizeHandler);
  }

  #animate() {
    const anim = () => {
      this.#raf = requestAnimationFrame(anim);
      if (this.#points) {
        this.#points.rotation.y += 0.0003;
        this.#points.rotation.x += 0.0001;
      }
      if (this.#graphGroup) {
        this.#graphGroup.rotation.y += 0.0015;
        this.#graphGroup.rotation.x += 0.0005;
      }
      this.#renderer.render(this.#scene, this.#camera);
    };
    anim();
  }

  destroy() {
    if (this.#raf) cancelAnimationFrame(this.#raf);
    if (this.#renderer) this.#renderer.dispose();
    if (this.#pm) this.#pm.dispose();
    if (this.#gp) this.#gp.dispose();
    if (this.#nodeMat) this.#nodeMat.dispose();
    if (this.#edgeMat) this.#edgeMat.dispose();
    if (this.#graphGroup) {
      this.#graphGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    this.#scene = null;
    if (this._mouseHandler) document.removeEventListener('mousemove', this._mouseHandler);
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
  }
}

export const particleBackground = new ParticleBackground();
