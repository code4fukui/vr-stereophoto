// stereo-texture for A-FRAME by @binzume
// https://qiita.com/binzume/items/0112efd5ee683d52ed39

AFRAME.registerComponent('stereo-texture', {
	schema: {
			mode: { default: "side-by-side", oneOf: ["side-by-side", "top-and-bottom"] }
	},
	init: function () {
			this._componentChanged = this._componentChanged.bind(this);
			this._checkVrMode = this._checkVrMode.bind(this);
			this.el.addEventListener('componentchanged', this._componentChanged, false);
			this.el.sceneEl.addEventListener('enter-vr', this._checkVrMode, false);
			this.el.sceneEl.addEventListener('exit-vr', this._checkVrMode, false);
	},
	update: function () {
			this._reset();
			if (this.el.getObject3D("mesh") === null) return;
			let luv = this._makeObj(1, "stereo-left").geometry.getAttribute("uv");
			let ruv = this._makeObj(2, "stereo-right").geometry.getAttribute("uv");
			if (this.data.mode == "side-by-side") {
					luv.setArray(luv.array.map((v, i) => i % 2 == 0 ? v / 2 : v));
					ruv.setArray(ruv.array.map((v, i) => i % 2 == 0 ? v / 2 + 0.5 : v));
			} else if (this.data.mode == "top-and-bottom") {
					luv.setArray(luv.array.map((v, i) => i % 2 == 1 ? v / 2 + 0.5 : v));
					ruv.setArray(ruv.array.map((v, i) => i % 2 == 1 ? v / 2 : v));
			}
			luv.needsUpdate = true;
			ruv.needsUpdate = true;

			this.el.getObject3D("mesh").visible = false;
			this._checkVrMode();
	},
	remove: function () {
			this.el.removeEventListener('componentchanged', this._componentChanged, false);
			this.el.sceneEl.removeEventListener('enter-vr', this._checkVrMode, false);
			this.el.sceneEl.removeEventListener('exit-vr', this._checkVrMode, false);
			this._reset();
	},
	_checkVrMode: function () {
			let leftObj = this.el.getObject3D("stereo-left");
			if (leftObj != null) {
					this.el.sceneEl.is('vr-mode') ? leftObj.layers.disable(0) : leftObj.layers.enable(0);
			}
	},
	_makeObj: function (layer, name) {
			let obj = this.el.getObject3D("mesh").clone();
			obj.geometry = obj.geometry.clone();
			obj.layers.set(layer);
			this.el.setObject3D(name, obj);
			return obj;
	},
	_reset: function () {
			if (this.el.getObject3D("stereo-left") != null) {
					this.el.getObject3D("mesh").visible = true;
					this.el.removeObject3D("stereo-left");
					this.el.removeObject3D("stereo-right");
			}
	},
	_componentChanged: function (ev) {
			if (ev.detail.name === 'geometry' || ev.detail.name === 'material') {
					this.update();
			}
	}
});
