/* Component: Hero Section */
import { BaseComponent } from './BaseComponent.js';
import { morphLogo } from '../animations/morphLogo.js';
import { textSplitter } from '../animations/textSplit.js';
import { revealEngine } from '../animations/reveal.js';
import { sharedRAF } from '../utils/raf.js';
import * as THREE from 'three';

export class HeroSection extends BaseComponent {
  #step = null;
  #renderer = null;
  #scene = null;
  #cam = null;
  #graphGroup = null;
  #pts = null;
  #nodeMat = null;
  #edgeMat = null;
  #pm = null;
  #gp = null;
  #mx = 0;
  #my = 0;

  mount() {
    this.heroTitle = this.$('#heroTitle');
    this.canvas3d = this.$('#hero3dCanvas');

    this.#initParticles();
    revealEngine.observe(this);
    if (this.heroTitle) textSplitter.split(this.heroTitle, { type: 'chars', stagger: 20 });
  }

  #isLowPerf() {
    return window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4;
  }

  #initParticles() {
    if (!this.canvas3d || this.#isLowPerf()) return;
    try {
      const w = this.canvas3d.parentElement.clientWidth || 400;
      const h = this.canvas3d.parentElement.clientHeight || 400;
      this.#scene = new THREE.Scene();
      this.#cam = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      this.#cam.position.z = 18;
      this.#renderer = new THREE.WebGLRenderer({ canvas: this.canvas3d, alpha: true, antialias: true });
      this.#renderer.setSize(w, h);
      this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.#graphGroup = new THREE.Group();
      const nodes = [];
      this.#nodeMat = new THREE.MeshBasicMaterial({ color: 0xB83A3A, transparent: true, opacity: 0.7 });
      this.#edgeMat = new THREE.LineBasicMaterial({ color: 0xA31F34, transparent: true, opacity: 0.15 });

      for (let i = 0; i < 40; i++) {
        const r = 3 + Math.random() * 3.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const v = new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );
        nodes.push(v);
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.15, 6, 6), this.#nodeMat);
        sphere.position.copy(v);
        this.#graphGroup.add(sphere);
      }

      for (let i = 0; i < 40; i++) {
        for (let j = i + 1; j < 40; j++) {
          const d = nodes[i].distanceTo(nodes[j]);
          if (d < 3.5) {
            const g = new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]]);
            this.#graphGroup.add(new THREE.Line(g, this.#edgeMat));
          }
        }
      }
      this.#scene.add(this.#graphGroup);

      this.#gp = new THREE.BufferGeometry();
      const pc = 400;
      const pos = new Float32Array(pc * 3);
      for (let i = 0; i < pc; i++) {
        const r = 5 + Math.random() * 4;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(p) * Math.cos(t);
        pos[i * 3 + 1] = r * Math.cos(p);
        pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
      }
      this.#gp.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.#pm = new THREE.PointsMaterial({ color: 0xB83A3A, size: 0.08, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
      this.#pts = new THREE.Points(this.#gp, this.#pm);
      this.#scene.add(this.#pts);

      const al = new THREE.AmbientLight(0x2A0808, 0.3);
      this.#scene.add(al);
      const dl = new THREE.DirectionalLight(0xA31F34, 0.6);
      dl.position.set(5, 10, 7);
      this.#scene.add(dl);

      this._heroMouseHandler = (e) => {
        this.#mx = (e.clientX / window.innerWidth - 0.5) * 2;
        this.#my = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      document.addEventListener('mousemove', this._heroMouseHandler);

      this.#step = () => {
        if (this.#graphGroup) {
          this.#graphGroup.rotation.x += 0.003;
          this.#graphGroup.rotation.y += 0.006;
        }
        if (this.#pts) {
          this.#pts.rotation.x += 0.001;
          this.#pts.rotation.y += 0.002;
        }
        if (this.#graphGroup) {
          this.#graphGroup.position.x += (this.#mx * 2 - this.#graphGroup.position.x) * 0.03;
          this.#graphGroup.position.y += (this.#my * 2 - this.#graphGroup.position.y) * 0.03;
        }
        if (this.#renderer && this.#scene && this.#cam) this.#renderer.render(this.#scene, this.#cam);
      };
      sharedRAF.add(this.#step);
    } catch (e) { /* silent */ }
  }

  destroy() {
    if (this.#step) sharedRAF.remove(this.#step);
    if (this._heroMouseHandler) document.removeEventListener('mousemove', this._heroMouseHandler);
    if (this.#renderer) this.#renderer.dispose();
    if (this.#nodeMat) this.#nodeMat.dispose();
    if (this.#edgeMat) this.#edgeMat.dispose();
    if (this.#pm) this.#pm.dispose();
    if (this.#gp) this.#gp.dispose();
  }
}

BaseComponent.define('hero-section', HeroSection);
