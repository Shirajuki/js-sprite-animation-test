import { E as Engine } from "./engine-53225de6.js";
let noop = () => {
};
let srOnlyStyle = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);";
function addToDom(node, canvas) {
  let container = canvas.parentNode;
  node.setAttribute("data-kontra", "");
  if (container) {
    let target = container.querySelector("[data-kontra]:last-of-type") || canvas;
    container.insertBefore(node, target.nextSibling);
  } else {
    document.body.appendChild(node);
  }
}
function removeFromArray(array, item) {
  let index = array.indexOf(item);
  if (index != -1) {
    array.splice(index, 1);
    return true;
  }
}
let callbacks$2 = {};
function emit(event, ...args) {
  (callbacks$2[event] || []).map((fn) => fn(...args));
}
let canvasEl, context;
let handler$1 = {
  // by using noop we can proxy both property and function calls
  // so neither will throw errors
  get(target, key) {
    if (key == "_proxy")
      return true;
    return noop;
  }
};
function getContext() {
  return context;
}
function init$1(canvas, { contextless = false } = {}) {
  canvasEl = document.getElementById(canvas) || canvas || document.querySelector("canvas");
  if (contextless) {
    canvasEl = canvasEl || new Proxy({}, handler$1);
  }
  if (!canvasEl) {
    throw Error("You must provide a canvas element for the game");
  }
  context = canvasEl.getContext("2d") || new Proxy({}, handler$1);
  context.imageSmoothingEnabled = false;
  emit("init");
  return { canvas: canvasEl, context };
}
class Animation {
  constructor({ spriteSheet, frames, frameRate, loop = true }) {
    this.spriteSheet = spriteSheet;
    this.frames = frames;
    this.frameRate = frameRate;
    this.loop = loop;
    let { width, height, margin = 0 } = spriteSheet.frame;
    this.width = width;
    this.height = height;
    this.margin = margin;
    this._f = 0;
    this._a = 0;
  }
  /**
   * Clone an animation so it can be used more than once. By default animations passed to [Sprite](api/sprite) will be cloned so no two sprites update the same animation. Otherwise two sprites who shared the same animation would make it update twice as fast.
   * @memberof Animation
   * @function clone
   *
   * @returns {Animation} A new Animation instance.
   */
  clone() {
    return new Animation(this);
  }
  /**
   * Reset an animation to the first frame.
   * @memberof Animation
   * @function reset
   */
  reset() {
    this._f = 0;
    this._a = 0;
  }
  /**
   * Update the animation.
   * @memberof Animation
   * @function update
   *
   * @param {Number} [dt=1/60] - Time since last update.
   */
  update(dt = 1 / 60) {
    if (!this.loop && this._f == this.frames.length - 1)
      return;
    this._a += dt;
    while (this._a * this.frameRate >= 1) {
      this._f = ++this._f % this.frames.length;
      this._a -= 1 / this.frameRate;
    }
  }
  /**
   * Draw the current frame of the animation.
   * @memberof Animation
   * @function render
   *
   * @param {Object} properties - Properties to draw the animation.
   * @param {Number} properties.x - X position to draw the animation.
   * @param {Number} properties.y - Y position to draw the animation.
   * @param {Number} [properties.width] - width of the sprite. Defaults to [Animation.width](api/animation#width).
   * @param {Number} [properties.height] - height of the sprite. Defaults to [Animation.height](api/animation#height).
   * @param {CanvasRenderingContext2D} [properties.context] - The context the animation should draw to. Defaults to [core.getContext()](api/core#getContext).
   */
  render({
    x,
    y,
    width = this.width,
    height = this.height,
    context: context2 = getContext()
  }) {
    let row = this.frames[this._f] / this.spriteSheet._f | 0;
    let col = this.frames[this._f] % this.spriteSheet._f | 0;
    context2.drawImage(
      this.spriteSheet.image,
      col * this.width + (col * 2 + 1) * this.margin,
      row * this.height + (row * 2 + 1) * this.margin,
      this.width,
      this.height,
      x,
      y,
      width,
      height
    );
  }
}
function factory$b() {
  return new Animation(...arguments);
}
function rotatePoint(point, angle) {
  let sin = Math.sin(angle);
  let cos = Math.cos(angle);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos
  };
}
function lerp(start, end, percent) {
  return start * (1 - percent) + end * percent;
}
function clamp(min, max, value) {
  return Math.min(Math.max(min, value), max);
}
function collides(obj1, obj2) {
  [obj1, obj2] = [obj1, obj2].map((obj) => getWorldRect(obj));
  return obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x && obj1.y < obj2.y + obj2.height && obj1.y + obj1.height > obj2.y;
}
function getWorldRect(obj) {
  let { x = 0, y = 0, width, height } = obj.world || obj;
  if (obj.mapwidth) {
    width = obj.mapwidth;
    height = obj.mapheight;
  }
  if (obj.anchor) {
    x -= width * obj.anchor.x;
    y -= height * obj.anchor.y;
  }
  if (width < 0) {
    x += width;
    width *= -1;
  }
  if (height < 0) {
    y += height;
    height *= -1;
  }
  return {
    x,
    y,
    width,
    height
  };
}
class Vector {
  constructor(x = 0, y = 0, vec = {}) {
    this.x = x;
    this.y = y;
    if (vec._c) {
      this.clamp(vec._a, vec._b, vec._d, vec._e);
      this.x = x;
      this.y = y;
    }
  }
  /**
   * Calculate the addition of the current vector with the given vector.
   * @memberof Vector
   * @function add
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to add to the current Vector.
   *
   * @returns {Vector} A new Vector instance whose value is the addition of the two vectors.
   */
  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y, this);
  }
  // @ifdef VECTOR_SUBTRACT
  /**
   * Calculate the subtraction of the current vector with the given vector.
   * @memberof Vector
   * @function subtract
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to subtract from the current Vector.
   *
   * @returns {Vector} A new Vector instance whose value is the subtraction of the two vectors.
   */
  subtract(vec) {
    return new Vector(this.x - vec.x, this.y - vec.y, this);
  }
  // @endif
  // @ifdef VECTOR_SCALE
  /**
   * Calculate the multiple of the current vector by a value.
   * @memberof Vector
   * @function scale
   *
   * @param {Number} value - Value to scale the current Vector.
   *
   * @returns {Vector} A new Vector instance whose value is multiplied by the scalar.
   */
  scale(value) {
    return new Vector(this.x * value, this.y * value);
  }
  // @endif
  // @ifdef VECTOR_NORMALIZE
  /**
   * Calculate the normalized value of the current vector. Requires the Vector [length](api/vector#length) function.
   * @memberof Vector
   * @function normalize
   *
   * @returns {Vector} A new Vector instance whose value is the normalized vector.
   */
  // @see https://github.com/jed/140bytes/wiki/Byte-saving-techniques#use-placeholder-arguments-instead-of-var
  normalize(length = this.length()) {
    return new Vector(this.x / length, this.y / length);
  }
  // @endif
  // @ifdef VECTOR_DOT||VECTOR_ANGLE
  /**
   * Calculate the dot product of the current vector with the given vector.
   * @memberof Vector
   * @function dot
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to dot product against.
   *
   * @returns {Number} The dot product of the vectors.
   */
  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }
  // @endif
  // @ifdef VECTOR_LENGTH||VECTOR_NORMALIZE||VECTOR_ANGLE
  /**
   * Calculate the length (magnitude) of the Vector.
   * @memberof Vector
   * @function length
   *
   * @returns {Number} The length of the vector.
   */
  length() {
    return Math.hypot(this.x, this.y);
  }
  // @endif
  // @ifdef VECTOR_DISTANCE
  /**
   * Calculate the distance between the current vector and the given vector.
   * @memberof Vector
   * @function distance
   *
   * @param {Vector|{x: number, y: number}} vector - Vector to calculate the distance between.
   *
   * @returns {Number} The distance between the two vectors.
   */
  distance(vec) {
    return Math.hypot(this.x - vec.x, this.y - vec.y);
  }
  // @endif
  // @ifdef VECTOR_ANGLE
  /**
   * Calculate the angle (in radians) between the current vector and the given vector. Requires the Vector [dot](api/vector#dot) and [length](api/vector#length) functions.
   * @memberof Vector
   * @function angle
   *
   * @param {Vector} vector - Vector to calculate the angle between.
   *
   * @returns {Number} The angle (in radians) between the two vectors.
   */
  angle(vec) {
    return Math.acos(this.dot(vec) / (this.length() * vec.length()));
  }
  // @endif
  // @ifdef VECTOR_CLAMP
  /**
   * Clamp the Vector between two points, preventing `x` and `y` from going below or above the minimum and maximum values. Perfect for keeping a sprite from going outside the game boundaries.
   *
   * ```js
   * import { Vector } from 'kontra';
   *
   * let vector = Vector(100, 200);
   * vector.clamp(0, 0, 200, 300);
   *
   * vector.x += 200;
   * console.log(vector.x);  //=> 200
   *
   * vector.y -= 300;
   * console.log(vector.y);  //=> 0
   *
   * vector.add({x: -500, y: 500});
   * console.log(vector);    //=> {x: 0, y: 300}
   * ```
   * @memberof Vector
   * @function clamp
   *
   * @param {Number} xMin - Minimum x value.
   * @param {Number} yMin - Minimum y value.
   * @param {Number} xMax - Maximum x value.
   * @param {Number} yMax - Maximum y value.
   */
  clamp(xMin, yMin, xMax, yMax) {
    this._c = true;
    this._a = xMin;
    this._b = yMin;
    this._d = xMax;
    this._e = yMax;
  }
  /**
   * X coordinate of the vector.
   * @memberof Vector
   * @property {Number} x
   */
  get x() {
    return this._x;
  }
  /**
   * Y coordinate of the vector.
   * @memberof Vector
   * @property {Number} y
   */
  get y() {
    return this._y;
  }
  set x(value) {
    this._x = this._c ? clamp(this._a, this._d, value) : value;
  }
  set y(value) {
    this._y = this._c ? clamp(this._b, this._e, value) : value;
  }
  // @endif
}
function factory$a() {
  return new Vector(...arguments);
}
class Updatable {
  constructor(properties) {
    return this.init(properties);
  }
  init(properties = {}) {
    this.position = factory$a();
    this.velocity = factory$a();
    this.acceleration = factory$a();
    this.ttl = Infinity;
    Object.assign(this, properties);
  }
  /**
   * Update the position of the game object and all children using their velocity and acceleration. Calls the game objects [advance()](api/gameObject#advance) function.
   * @memberof GameObject
   * @function update
   * @page GameObject
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    this.advance(dt);
  }
  /**
   * Move the game object by its acceleration and velocity. If you pass `dt` it will multiply the vector and acceleration by that number. This means the `dx`, `dy`, `ddx` and `ddy` should be how far you want the object to move in 1 second rather than in 1 frame.
   *
   * If you override the game objects [update()](api/gameObject#update) function with your own update function, you can call this function to move the game object normally.
   *
   * ```js
   * import { GameObject } from 'kontra';
   *
   * let gameObject = GameObject({
   *   x: 100,
   *   y: 200,
   *   width: 20,
   *   height: 40,
   *   dx: 5,
   *   dy: 2,
   *   update: function() {
   *     // move the game object normally
   *     this.advance();
   *
   *     // change the velocity at the edges of the canvas
   *     if (this.x < 0 ||
   *         this.x + this.width > this.context.canvas.width) {
   *       this.dx = -this.dx;
   *     }
   *     if (this.y < 0 ||
   *         this.y + this.height > this.context.canvas.height) {
   *       this.dy = -this.dy;
   *     }
   *   }
   * });
   * ```
   * @memberof GameObject
   * @function advance
   * @page GameObject
   *
   * @param {Number} [dt] - Time since last update.
   *
   */
  advance(dt) {
    let acceleration = this.acceleration;
    if (dt) {
      acceleration = acceleration.scale(dt);
    }
    this.velocity = this.velocity.add(acceleration);
    let velocity = this.velocity;
    if (dt) {
      velocity = velocity.scale(dt);
    }
    this.position = this.position.add(velocity);
    this._pc();
    this.ttl--;
  }
  // --------------------------------------------------
  // velocity
  // --------------------------------------------------
  // @ifdef GAMEOBJECT_VELOCITY
  /**
   * X coordinate of the velocity vector.
   * @memberof GameObject
   * @property {Number} dx
   * @page GameObject
   */
  get dx() {
    return this.velocity.x;
  }
  /**
   * Y coordinate of the velocity vector.
   * @memberof GameObject
   * @property {Number} dy
   * @page GameObject
   */
  get dy() {
    return this.velocity.y;
  }
  set dx(value) {
    this.velocity.x = value;
  }
  set dy(value) {
    this.velocity.y = value;
  }
  // @endif
  // --------------------------------------------------
  // acceleration
  // --------------------------------------------------
  // @ifdef GAMEOBJECT_ACCELERATION
  /**
   * X coordinate of the acceleration vector.
   * @memberof GameObject
   * @property {Number} ddx
   * @page GameObject
   */
  get ddx() {
    return this.acceleration.x;
  }
  /**
   * Y coordinate of the acceleration vector.
   * @memberof GameObject
   * @property {Number} ddy
   * @page GameObject
   */
  get ddy() {
    return this.acceleration.y;
  }
  set ddx(value) {
    this.acceleration.x = value;
  }
  set ddy(value) {
    this.acceleration.y = value;
  }
  // @endif
  // --------------------------------------------------
  // ttl
  // --------------------------------------------------
  // @ifdef GAMEOBJECT_TTL
  /**
   * Check if the game object is alive.
   * @memberof GameObject
   * @function isAlive
   * @page GameObject
   *
   * @returns {Boolean} `true` if the game objects [ttl](api/gameObject#ttl) property is above `0`, `false` otherwise.
   */
  isAlive() {
    return this.ttl > 0;
  }
  // @endif
  _pc() {
  }
}
class GameObject extends Updatable {
  /**
   * @docs docs/api_docs/gameObject.js
   */
  /**
   * Use this function to reinitialize a game object. It takes the same properties object as the constructor. Useful it you want to repurpose a game object.
   * @memberof GameObject
   * @function init
   *
   * @param {Object} properties - Properties of the game object.
   */
  init({
    // --------------------------------------------------
    // defaults
    // --------------------------------------------------
    /**
     * The width of the game object. Represents the local width of the object as opposed to the [world](api/gameObject#world) width.
     * @memberof GameObject
     * @property {Number} width
     */
    width = 0,
    /**
     * The height of the game object. Represents the local height of the object as opposed to the [world](api/gameObject#world) height.
     * @memberof GameObject
     * @property {Number} height
     */
    height = 0,
    /**
     * The context the game object will draw to.
     * @memberof GameObject
     * @property {CanvasRenderingContext2D} context
     */
    context: context2 = getContext(),
    render = this.draw,
    update = this.advance,
    // --------------------------------------------------
    // optionals
    // --------------------------------------------------
    // @ifdef GAMEOBJECT_GROUP
    /**
     * The game objects parent object.
     * @memberof GameObject
     * @property {GameObject|null} parent
     */
    /**
     * The game objects children objects.
     * @memberof GameObject
     * @property {GameObject[]} children
     */
    children = [],
    // @endif
    // @ifdef GAMEOBJECT_ANCHOR
    /**
     * The x and y origin of the game object. {x:0, y:0} is the top left corner of the game object, {x:1, y:1} is the bottom right corner.
     * @memberof GameObject
     * @property {{x: Number, y: Number}} anchor
     *
     * @example
     * // exclude-code:start
     * let { GameObject } = kontra;
     * // exclude-code:end
     * // exclude-script:start
     * import { GameObject } from 'kontra';
     * // exclude-script:end
     *
     * let gameObject = GameObject({
     *   x: 150,
     *   y: 100,
     *   width: 50,
     *   height: 50,
     *   color: 'red',
     *   // exclude-code:start
     *   context: context,
     *   // exclude-code:end
     *   render: function() {
     *     this.context.fillStyle = this.color;
     *     this.context.fillRect(0, 0, this.height, this.width);
     *   }
     * });
     *
     * function drawOrigin(gameObject) {
     *   gameObject.context.fillStyle = 'yellow';
     *   gameObject.context.beginPath();
     *   gameObject.context.arc(gameObject.x, gameObject.y, 3, 0, 2*Math.PI);
     *   gameObject.context.fill();
     * }
     *
     * gameObject.render();
     * drawOrigin(gameObject);
     *
     * gameObject.anchor = {x: 0.5, y: 0.5};
     * gameObject.x = 300;
     * gameObject.render();
     * drawOrigin(gameObject);
     *
     * gameObject.anchor = {x: 1, y: 1};
     * gameObject.x = 450;
     * gameObject.render();
     * drawOrigin(gameObject);
     */
    anchor = { x: 0, y: 0 },
    // @endif
    // @ifdef GAMEOBJECT_OPACITY
    /**
     * The opacity of the object. Represents the local opacity of the object as opposed to the [world](api/gameObject#world) opacity.
     * @memberof GameObject
     * @property {Number} opacity
     */
    opacity = 1,
    // @endif
    // @ifdef GAMEOBJECT_ROTATION
    /**
     * The rotation of the game object around the anchor in radians. Represents the local rotation of the object as opposed to the [world](api/gameObject#world) rotation.
     * @memberof GameObject
     * @property {Number} rotation
     */
    rotation = 0,
    // @endif
    // @ifdef GAMEOBJECT_SCALE
    /**
     * The x scale of the object. Represents the local x scale of the object as opposed to the [world](api/gameObject#world) x scale.
     * @memberof GameObject
     * @property {Number} scaleX
     */
    scaleX = 1,
    /**
     * The y scale of the object. Represents the local y scale of the object as opposed to the [world](api/gameObject#world) y scale.
     * @memberof GameObject
     * @property {Number} scaleY
     */
    scaleY = 1,
    // @endif
    ...props
  } = {}) {
    this._c = [];
    super.init({
      width,
      height,
      context: context2,
      // @ifdef GAMEOBJECT_ANCHOR
      anchor,
      // @endif
      // @ifdef GAMEOBJECT_OPACITY
      opacity,
      // @endif
      // @ifdef GAMEOBJECT_ROTATION
      rotation,
      // @endif
      // @ifdef GAMEOBJECT_SCALE
      scaleX,
      scaleY,
      // @endif
      ...props
    });
    this._di = true;
    this._uw();
    this.addChild(children);
    this._rf = render;
    this._uf = update;
  }
  /**
   * Update all children
   */
  update(dt) {
    this._uf(dt);
    this.children.map((child) => child.update && child.update(dt));
  }
  /**
   * Render the game object and all children. Calls the game objects [draw()](api/gameObject#draw) function.
   * @memberof GameObject
   * @function render
   */
  render() {
    let context2 = this.context;
    context2.save();
    if (this.x || this.y) {
      context2.translate(this.x, this.y);
    }
    if (this.rotation) {
      context2.rotate(this.rotation);
    }
    if (this.scaleX != 1 || this.scaleY != 1) {
      context2.scale(this.scaleX, this.scaleY);
    }
    let anchorX = -this.width * this.anchor.x;
    let anchorY = -this.height * this.anchor.y;
    if (anchorX || anchorY) {
      context2.translate(anchorX, anchorY);
    }
    this.context.globalAlpha = this.opacity;
    this._rf();
    if (anchorX || anchorY) {
      context2.translate(-anchorX, -anchorY);
    }
    let children = this.children;
    children.map((child) => child.render && child.render());
    context2.restore();
  }
  /**
   * Draw the game object at its X and Y position, taking into account rotation, scale, and anchor.
   *
   * Do note that the canvas has been rotated and translated to the objects position (taking into account anchor), so {0,0} will be the top-left corner of the game object when drawing.
   *
   * If you override the game objects `render()` function with your own render function, you can call this function to draw the game object normally.
   *
   * ```js
   * let { GameObject } = kontra;
   *
   * let gameObject = GameObject({
   *  x: 290,
   *  y: 80,
   *  width: 20,
   *  height: 40,
   *
   *  render: function() {
   *    // draw the game object normally (perform rotation and other transforms)
   *    this.draw();
   *
   *    // outline the game object
   *    this.context.strokeStyle = 'yellow';
   *    this.context.lineWidth = 2;
   *    this.context.strokeRect(0, 0, this.width, this.height);
   *  }
   * });
   *
   * gameObject.render();
   * ```
   * @memberof GameObject
   * @function draw
   */
  draw() {
  }
  /**
   * Sync property changes from the parent to the child
   */
  _pc() {
    this._uw();
    this.children.map((child) => child._pc());
  }
  /**
   * X coordinate of the position vector.
   * @memberof GameObject
   * @property {Number} x
   */
  get x() {
    return this.position.x;
  }
  /**
   * Y coordinate of the position vector.
   * @memberof GameObject
   * @property {Number} y
   */
  get y() {
    return this.position.y;
  }
  set x(value) {
    this.position.x = value;
    this._pc();
  }
  set y(value) {
    this.position.y = value;
    this._pc();
  }
  get width() {
    return this._w;
  }
  set width(value) {
    this._w = value;
    this._pc();
  }
  get height() {
    return this._h;
  }
  set height(value) {
    this._h = value;
    this._pc();
  }
  /**
   * Update world properties
   */
  _uw() {
    if (!this._di)
      return;
    let {
      _wx = 0,
      _wy = 0,
      // @ifdef GAMEOBJECT_OPACITY
      _wo = 1,
      // @endif
      // @ifdef GAMEOBJECT_ROTATION
      _wr = 0,
      // @endif
      // @ifdef GAMEOBJECT_SCALE
      _wsx = 1,
      _wsy = 1
      // @endif
    } = this.parent || {};
    this._wx = this.x;
    this._wy = this.y;
    this._ww = this.width;
    this._wh = this.height;
    this._wo = _wo * this.opacity;
    this._wsx = _wsx * this.scaleX;
    this._wsy = _wsy * this.scaleY;
    this._wx = this._wx * _wsx;
    this._wy = this._wy * _wsy;
    this._ww = this.width * this._wsx;
    this._wh = this.height * this._wsy;
    this._wr = _wr + this.rotation;
    let { x, y } = rotatePoint({ x: this._wx, y: this._wy }, _wr);
    this._wx = x;
    this._wy = y;
    this._wx += _wx;
    this._wy += _wy;
  }
  /**
   * The world position, width, height, opacity, rotation, and scale. The world property is the true position, width, height, etc. of the object, taking into account all parents.
   *
   * The world property does not adjust for anchor or scale, so if you set a negative scale the world width or height could be negative. Use [getWorldRect](/api/helpers#getWorldRect) to get the world position and size adjusted for anchor and scale.
   * @property {{x: Number, y: Number, width: Number, height: Number, opacity: Number, rotation: Number, scaleX: Number, scaleY: Number}} world
   * @memberof GameObject
   */
  get world() {
    return {
      x: this._wx,
      y: this._wy,
      width: this._ww,
      height: this._wh,
      // @ifdef GAMEOBJECT_OPACITY
      opacity: this._wo,
      // @endif
      // @ifdef GAMEOBJECT_ROTATION
      rotation: this._wr,
      // @endif
      // @ifdef GAMEOBJECT_SCALE
      scaleX: this._wsx,
      scaleY: this._wsy
      // @endif
    };
  }
  // --------------------------------------------------
  // group
  // --------------------------------------------------
  // @ifdef GAMEOBJECT_GROUP
  set children(value) {
    this.removeChild(this._c);
    this.addChild(value);
  }
  get children() {
    return this._c;
  }
  /**
   * Add an object as a child to this object. The objects position, size, and rotation will be relative to the parents position, size, and rotation. The childs [world](api/gameObject#world) property will be updated to take into account this object and all of its parents.
   * @memberof GameObject
   * @function addChild
   *
   * @param {...(GameObject|GameObject[])[]} objects - Object to add as a child. Can be a single object, an array of objects, or a comma-separated list of objects.
   *
   * @example
   * // exclude-code:start
   * let { GameObject } = kontra;
   * // exclude-code:end
   * // exclude-script:start
   * import { GameObject } from 'kontra';
   * // exclude-script:end
   *
   * function createObject(x, y, color, size = 1) {
   *   return GameObject({
   *     x,
   *     y,
   *     width: 50 / size,
   *     height: 50 / size,
   *     anchor: {x: 0.5, y: 0.5},
   *     color,
   *     // exclude-code:start
   *     context: context,
   *     // exclude-code:end
   *     render: function() {
   *       this.context.fillStyle = this.color;
   *       this.context.fillRect(0, 0, this.height, this.width);
   *     }
   *   });
   * }
   *
   * let parent = createObject(300, 100, 'red');
   *
   * // create a child that is 25px to the right and
   * // down from the parents position
   * let child = createObject(25, 25, 'yellow', 2);
   *
   * parent.addChild(child);
   *
   * parent.render();
   */
  addChild(...objects) {
    objects.flat().map((child) => {
      this.children.push(child);
      child.parent = this;
      child._pc = child._pc || noop;
      child._pc();
    });
  }
  /**
   * Remove an object as a child of this object. The removed objects [world](api/gameObject#world) property will be updated to not take into account this object and all of its parents.
   * @memberof GameObject
   * @function removeChild
   *
   * @param {...(GameObject|GameObject[])[]} objects - Object to remove as a child. Can be a single object, an array of objects, or a comma-separated list of objects.
   */
  removeChild(...objects) {
    objects.flat().map((child) => {
      if (removeFromArray(this.children, child)) {
        child.parent = null;
        child._pc();
      }
    });
  }
  // @endif
  // --------------------------------------------------
  // opacity
  // --------------------------------------------------
  // @ifdef GAMEOBJECT_OPACITY
  get opacity() {
    return this._opa;
  }
  set opacity(value) {
    this._opa = value;
    this._pc();
  }
  // @endif
  // --------------------------------------------------
  // rotation
  // --------------------------------------------------
  // @ifdef GAMEOBJECT_ROTATION
  get rotation() {
    return this._rot;
  }
  set rotation(value) {
    this._rot = value;
    this._pc();
  }
  // @endif
  // --------------------------------------------------
  // scale
  // --------------------------------------------------
  // @ifdef GAMEOBJECT_SCALE
  /**
   * Set the x and y scale of the object. If only one value is passed, both are set to the same value.
   * @memberof GameObject
   * @function setScale
   *
   * @param {Number} x - X scale value.
   * @param {Number} [y=x] - Y scale value.
   */
  setScale(x, y = x) {
    this.scaleX = x;
    this.scaleY = y;
  }
  get scaleX() {
    return this._scx;
  }
  set scaleX(value) {
    this._scx = value;
    this._pc();
  }
  get scaleY() {
    return this._scy;
  }
  set scaleY(value) {
    this._scy = value;
    this._pc();
  }
  // @endif
}
function factory$9() {
  return new GameObject(...arguments);
}
class Sprite extends GameObject {
  /**
   * @docs docs/api_docs/sprite.js
   */
  init({
    /**
     * The color of the game object if it was passed as an argument.
     * @memberof Sprite
     * @property {String} color
     */
    // @ifdef SPRITE_IMAGE
    /**
     * The image the sprite will use when drawn if passed as an argument.
     * @memberof Sprite
     * @property {HTMLImageElement|HTMLCanvasElement} image
     */
    image,
    /**
     * The width of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the width of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the width of a single frame of the animation.
     * @memberof Sprite
     * @property {Number} width
     */
    width = image ? image.width : void 0,
    /**
     * The height of the sprite. If the sprite is a [rectangle sprite](api/sprite#rectangle-sprite), it uses the passed in value. For an [image sprite](api/sprite#image-sprite) it is the height of the image. And for an [animation sprite](api/sprite#animation-sprite) it is the height of a single frame of the animation.
     * @memberof Sprite
     * @property {Number} height
     */
    height = image ? image.height : void 0,
    // @endif
    ...props
  } = {}) {
    super.init({
      // @ifdef SPRITE_IMAGE
      image,
      width,
      height,
      // @endif
      ...props
    });
  }
  // @ifdef SPRITE_ANIMATION
  /**
   * An object of [Animations](api/animation) from a [SpriteSheet](api/spriteSheet) to animate the sprite. Each animation is named so that it can can be used by name for the sprites [playAnimation()](api/sprite#playAnimation) function.
   *
   * ```js
   * import { Sprite, SpriteSheet } from 'kontra';
   *
   * let spriteSheet = SpriteSheet({
   *   // ...
   *   animations: {
   *     idle: {
   *       frames: 1,
   *       loop: false,
   *     },
   *     walk: {
   *       frames: [1,2,3]
   *     }
   *   }
   * });
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   animations: spriteSheet.animations
   * });
   *
   * sprite.playAnimation('idle');
   * ```
   * @memberof Sprite
   * @property {{[name: String] : Animation}} animations
   */
  get animations() {
    return this._a;
  }
  set animations(value) {
    let prop, firstAnimation;
    this._a = {};
    for (prop in value) {
      this._a[prop] = value[prop].clone();
      firstAnimation = firstAnimation || this._a[prop];
    }
    this.currentAnimation = firstAnimation;
    this.width = this.width || firstAnimation.width;
    this.height = this.height || firstAnimation.height;
  }
  /**
   * Set the currently playing animation of an animation sprite.
   *
   * ```js
   * import { Sprite, SpriteSheet } from 'kontra';
   *
   * let spriteSheet = SpriteSheet({
   *   // ...
   *   animations: {
   *     idle: {
   *       frames: 1
   *     },
   *     walk: {
   *       frames: [1,2,3]
   *     }
   *   }
   * });
   *
   * let sprite = Sprite({
   *   x: 100,
   *   y: 200,
   *   animations: spriteSheet.animations
   * });
   *
   * sprite.playAnimation('idle');
   * ```
   * @memberof Sprite
   * @function playAnimation
   *
   * @param {String} name - Name of the animation to play.
   */
  playAnimation(name) {
    this.currentAnimation = this.animations[name];
    if (!this.currentAnimation.loop) {
      this.currentAnimation.reset();
    }
  }
  advance(dt) {
    super.advance(dt);
    if (this.currentAnimation) {
      this.currentAnimation.update(dt);
    }
  }
  // @endif
  draw() {
    if (this.image) {
      this.context.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height
      );
    }
    if (this.currentAnimation) {
      this.currentAnimation.render({
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        context: this.context
      });
    }
    if (this.color) {
      this.context.fillStyle = this.color;
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }
}
function factory$8() {
  return new Sprite(...arguments);
}
let fontSizeRegex = /(\d+)(\w+)/;
function parseFont(font) {
  let match = font.match(fontSizeRegex);
  let size = +match[1];
  let unit = match[2];
  let computed = size;
  return {
    size,
    unit,
    computed
  };
}
class Text extends GameObject {
  init({
    // --------------------------------------------------
    // defaults
    // --------------------------------------------------
    /**
     * The string of text. Use newline characters to create multi-line strings.
     * @memberof Text
     * @property {String} text
     */
    text = "",
    /**
     * The text alignment.
     * @memberof Text
     * @property {String} textAlign
     */
    textAlign = "",
    /**
     * The distance between two lines of text. The value is multiplied by the texts font size.
     * @memberof Text
     * @property {Number} lineHeight
     */
    lineHeight = 1,
    /**
     * The font style.
     * @memberof Text
     * @property {String} font
     */
    font = getContext().font,
    /**
     * The color of the text.
     * @memberof Text
     * @property {String} color
     */
    ...props
  } = {}) {
    text = "" + text;
    super.init({
      text,
      textAlign,
      lineHeight,
      font,
      ...props
    });
    this._p();
  }
  // keep width and height getters/settings so we can set _w and _h
  // and not trigger infinite call loops
  get width() {
    return this._w;
  }
  set width(value) {
    this._d = true;
    this._w = value;
    this._fw = value;
  }
  get text() {
    return this._t;
  }
  set text(value) {
    this._d = true;
    this._t = "" + value;
  }
  get font() {
    return this._f;
  }
  set font(value) {
    this._d = true;
    this._f = value;
    this._fs = parseFont(value).computed;
  }
  get lineHeight() {
    return this._lh;
  }
  set lineHeight(value) {
    this._d = true;
    this._lh = value;
  }
  render() {
    if (this._d) {
      this._p();
    }
    super.render();
  }
  /**
   * Calculate the font width, height, and text strings before rendering.
   */
  _p() {
    this._s = [];
    this._d = false;
    let context2 = this.context;
    context2.font = this.font;
    if (!this._s.length && this._fw) {
      let parts = this.text.split(" ");
      let start = 0;
      let i = 2;
      for (; i <= parts.length; i++) {
        let str = parts.slice(start, i).join(" ");
        let width = context2.measureText(str).width;
        if (width > this._fw) {
          this._s.push(parts.slice(start, i - 1).join(" "));
          start = i - 1;
        }
      }
      this._s.push(parts.slice(start, i).join(" "));
    }
    if (!this._s.length && this.text.includes("\n")) {
      let width = 0;
      this.text.split("\n").map((str) => {
        this._s.push(str);
        width = Math.max(width, context2.measureText(str).width);
      });
      this._w = this._fw || width;
    }
    if (!this._s.length) {
      this._s.push(this.text);
      this._w = this._fw || context2.measureText(this.text).width;
    }
    this.height = this._fs + (this._s.length - 1) * this._fs * this.lineHeight;
    this._uw();
  }
  draw() {
    let alignX = 0;
    let textAlign = this.textAlign;
    let context2 = this.context;
    textAlign = this.textAlign || (context2.canvas.dir == "rtl" ? "right" : "left");
    alignX = textAlign == "right" ? this.width : textAlign == "center" ? this.width / 2 | 0 : 0;
    this._s.map((str, index) => {
      context2.textBaseline = "top";
      context2.textAlign = textAlign;
      context2.fillStyle = this.color;
      context2.font = this.font;
      context2.fillText(
        str,
        alignX,
        this._fs * this.lineHeight * index
      );
    });
  }
}
function factory$7() {
  return new Text(...arguments);
}
function clear(context2) {
  let canvas = context2.canvas;
  context2.clearRect(0, 0, canvas.width, canvas.height);
}
function GameLoop({
  fps = 60,
  clearCanvas = true,
  update = noop,
  render,
  context: context2 = getContext(),
  blur = false
} = {}) {
  if (!render) {
    throw Error("You must provide a render() function");
  }
  let accumulator = 0;
  let delta = 1e3 / fps;
  let step = 1 / fps;
  let clearFn = clearCanvas ? clear : noop;
  let last, rAF, now, dt, loop;
  let focused = true;
  if (!blur) {
    window.addEventListener("focus", () => {
      focused = true;
    });
    window.addEventListener("blur", () => {
      focused = false;
    });
  }
  function frame() {
    rAF = requestAnimationFrame(frame);
    if (!focused)
      return;
    now = performance.now();
    dt = now - last;
    last = now;
    if (dt > 1e3) {
      return;
    }
    emit("tick");
    accumulator += dt;
    while (accumulator >= delta) {
      loop.update(step);
      accumulator -= delta;
    }
    clearFn(context2);
    loop.render();
  }
  loop = {
    /**
     * Called every frame to update the game. Put all of your games update logic here.
     * @memberof GameLoop
     * @function update
     *
     * @param {Number} [dt] - The fixed dt time of 1/60 of a frame.
     */
    update,
    /**
     * Called every frame to render the game. Put all of your games render logic here.
     * @memberof GameLoop
     * @function render
     */
    render,
    /**
     * If the game loop is currently stopped.
     *
     * ```js
     * import { GameLoop } from 'kontra';
     *
     * let loop = GameLoop({
     *   // ...
     * });
     * console.log(loop.isStopped);  //=> true
     *
     * loop.start();
     * console.log(loop.isStopped);  //=> false
     *
     * loop.stop();
     * console.log(loop.isStopped);  //=> true
     * ```
     * @memberof GameLoop
     * @property {Boolean} isStopped
     */
    isStopped: true,
    /**
     * Start the game loop.
     * @memberof GameLoop
     * @function start
     */
    start() {
      last = performance.now();
      this.isStopped = false;
      requestAnimationFrame(frame);
    },
    /**
     * Stop the game loop.
     * @memberof GameLoop
     * @function stop
     */
    stop() {
      this.isStopped = true;
      cancelAnimationFrame(rAF);
    },
    // expose properties for testing
    // @ifdef DEBUG
    _frame: frame,
    set _last(value) {
      last = value;
    }
    // @endif
  };
  return loop;
}
let keydownCallbacks = {};
let keyupCallbacks = {};
let pressedKeys = {};
let keyMap = {
  // named keys
  Enter: "enter",
  Escape: "esc",
  Space: "space",
  ArrowLeft: "arrowleft",
  ArrowUp: "arrowup",
  ArrowRight: "arrowright",
  ArrowDown: "arrowdown"
};
function call(callback = noop, evt) {
  if (callback._pd) {
    evt.preventDefault();
  }
  callback(evt);
}
function keydownEventHandler(evt) {
  let key = keyMap[evt.code];
  let callback = keydownCallbacks[key];
  pressedKeys[key] = true;
  call(callback, evt);
}
function keyupEventHandler(evt) {
  let key = keyMap[evt.code];
  let callback = keyupCallbacks[key];
  pressedKeys[key] = false;
  call(callback, evt);
}
function blurEventHandler() {
  pressedKeys = {};
}
function initKeys() {
  let i;
  for (i = 0; i < 26; i++) {
    keyMap["Key" + String.fromCharCode(i + 65)] = String.fromCharCode(
      i + 97
    );
  }
  for (i = 0; i < 10; i++) {
    keyMap["Digit" + i] = keyMap["Numpad" + i] = "" + i;
  }
  window.addEventListener("keydown", keydownEventHandler);
  window.addEventListener("keyup", keyupEventHandler);
  window.addEventListener("blur", blurEventHandler);
}
function keyPressed(key) {
  return !!pressedKeys[key];
}
function getAllNodes(object) {
  let nodes = [];
  if (object._dn) {
    nodes.push(object._dn);
  } else if (object.children) {
    object.children.map((child) => {
      nodes = nodes.concat(getAllNodes(child));
    });
  }
  return nodes;
}
class Scene {
  constructor({
    /**
     * The id of the scene.
     * @memberof Scene
     * @property {String} id
     */
    id,
    /**
     * The name of the scene. Used by screen readers to identify each scene. Use this property to give the scene a human friendly name.
     * @memberof Scene
     * @property {String} name
     */
    name = id,
    /**
     * The objects of the scene.
     * @memberof Scene
     * @property {Object[]} objects
     */
    objects = [],
    /**
     * The context the scene will draw to.
     * @memberof Scene
     * @property {CanvasRenderingContext2D} context
     */
    context: context2 = getContext(),
    /**
     * If the camera should cull objects outside the camera bounds. Not rendering objects which can't be seen greatly improves the performance.
     * @memberof Scene
     * @property {Boolean} cullObjects
     */
    cullObjects = true,
    /**
     * Camera culling function which prevents objects outside the camera screen from rendering.
     * @memberof Scene
     * @property {Function} cullFunction
     */
    cullFunction = collides,
    /**
     * Function used to sort the objects of the scene before rendering. Can be used in conjunction with [helpers.depthSort](/api/helpers#depthSort). Only direct objects of the scene are sorted.
     *
     * ```js
     * import { Scene, Sprite, depthSort } from 'kontra';
     *
     * let sprite1 = Sprite({
     *   // ...
     * });
     * let sprite2 = Sprite({
     *   // ...
     * });
     *
     * let scene = Scene({
     *   id: 'game',
     *   objects: [sprite1, sprite2],
     *   sortFunction: depthSort
     * });
     *
     * scene.render();
     * ```
     * @memberof Scene
     * @property {Function} sortFunction
     */
    sortFunction,
    ...props
  }) {
    this._o = [];
    let canvas = context2.canvas;
    let section = this._dn = document.createElement("section");
    section.tabIndex = -1;
    section.style = srOnlyStyle;
    section.id = id;
    section.setAttribute("aria-label", name);
    addToDom(section, canvas);
    Object.assign(this, {
      id,
      name,
      context: context2,
      cullObjects,
      cullFunction,
      sortFunction,
      ...props
    });
    let { width, height } = canvas;
    let x = width / 2;
    let y = height / 2;
    this.camera = factory$9({
      x,
      y,
      width,
      height,
      context: context2,
      centerX: x,
      centerY: y,
      anchor: { x: 0.5, y: 0.5 },
      render: this._rf.bind(this)
    });
    this.add(objects);
  }
  set objects(value) {
    this.remove(this._o);
    this.add(value);
  }
  get objects() {
    return this._o;
  }
  /**
   * Add an object to the scene.
   * @memberof Scene
   * @function add
   *
   * @param {...(Object|Object[])[]} objects - Object to add. Can be a single object, an array of objects, or a comma-separated list of objects.
   */
  add(...objects) {
    objects.flat().map((object) => {
      this._o.push(object);
      getAllNodes(object).map((node) => {
        this._dn.appendChild(node);
      });
    });
  }
  /**
   * Remove an object from the scene.
   * @memberof Scene
   * @function remove
   *
   * @param {...(Object|Object[])[]} objects - Object to remove. Can be a single object, an array of objects, or a comma-separated list of objects.
   */
  remove(...objects) {
    objects.flat().map((object) => {
      removeFromArray(this._o, object);
      getAllNodes(object).map((node) => {
        addToDom(node, this.context);
      });
    });
  }
  /**
   * Show the scene and resume update and render. Calls [onShow](api/scene#onShow) if passed.
   * @memberof Scene
   * @function show
   */
  show() {
    this.hidden = this._dn.hidden = false;
    let focusableObject = this._o.find((object) => object.focus);
    if (focusableObject) {
      focusableObject.focus();
    } else {
      this._dn.focus();
    }
    this.onShow();
  }
  /**
   * Hide the scene. A hidden scene will not update or render. Calls [onHide](api/scene#onHide) if passed.
   * @memberof Scene
   * @function hide
   */
  hide() {
    this.hidden = this._dn.hidden = true;
    this.onHide();
  }
  /**
   * Clean up the scene and call `destroy()` on all objects.
   * @memberof Scene
   * @function destroy
   */
  destroy() {
    this._dn.remove();
    this._o.map((object) => object.destroy && object.destroy());
  }
  /**
   * Focus the camera to the objects x/y position. As the scene is scaled the focal point will keep to the position.
   * @memberof Scene
   * @function lookAt
   *
   * @param {{x: Number, y: Number}} object - Object to look at.
   */
  lookAt(object) {
    let { x, y } = object.world || object;
    this.camera.x = x;
    this.camera.y = y;
  }
  /**
   * Update all objects of the scene by calling the objects `update()` function.
   * @memberof Scene
   * @function update
   *
   * @param {Number} [dt] - Time since last update.
   */
  update(dt) {
    if (!this.hidden) {
      this._o.map((object) => object.update && object.update(dt));
    }
  }
  /**
   * Render all children inside the cameras render function, essentially treating the scenes objects as children of the camera. This allows the camera to control the position, scale, and rotation of the scene.
   */
  _rf() {
    let {
      _o,
      context: context2,
      _sx,
      _sy,
      camera,
      sortFunction,
      cullObjects,
      cullFunction
    } = this;
    context2.translate(_sx, _sy);
    let objects = _o;
    if (cullObjects) {
      objects = objects.filter(
        (object) => cullFunction(camera, object)
      );
    }
    if (sortFunction) {
      objects.sort(sortFunction);
    }
    objects.map((object) => object.render && object.render());
  }
  /**
   * Render all objects of the scene by calling the objects `render()` function. If [cullObjects](/api/scene#cullObjects) is set to true then only those objects which are inside the camera bounds will be rendered.
   * @memberof Scene
   * @function render
   */
  render() {
    if (!this.hidden) {
      let { context: context2, camera } = this;
      let { x, y, centerX, centerY } = camera;
      context2.save();
      this._sx = centerX - x;
      this._sy = centerY - y;
      context2.translate(this._sx, this._sy);
      camera.render();
      context2.restore();
    }
  }
  /**
   * Function called when the scene is shown. Override this function to have the scene do something when shown, such as adding input events.
   *
   * ```js
   * let { Scene, onKey } = 'kontra';
   *
   * let scene = Scene({
   *   onShow() {
   *     onKey('arrowup', () => {
   *       // ...
   *     })
   *   }
   * });
   * ```
   * @memberof Scene
   * @function onShow
   */
  onShow() {
  }
  /**
   * Function called when the scene is hidden. Override this function to have the scene do something when hidden, such as cleaning up input events.
   *
   * ```js
   * let { Scene, offKey } = 'kontra';
   *
   * let scene = Scene({
   *   onHide() {
   *     offKey('arrowup');
   *   }
   * });
   * ```
   * @memberof Scene
   * @function onHide
   */
  onHide() {
  }
}
function factory$2() {
  return new Scene(...arguments);
}
function parseFrames(consecutiveFrames) {
  if (+consecutiveFrames == consecutiveFrames) {
    return consecutiveFrames;
  }
  let sequence = [];
  let frames = consecutiveFrames.split("..");
  let start = +frames[0];
  let end = +frames[1];
  let i = start;
  if (start < end) {
    for (; i <= end; i++) {
      sequence.push(i);
    }
  } else {
    for (; i >= end; i--) {
      sequence.push(i);
    }
  }
  return sequence;
}
class SpriteSheet {
  constructor({
    image,
    frameWidth,
    frameHeight,
    frameMargin,
    animations
  } = {}) {
    if (!image) {
      throw Error("You must provide an Image for the SpriteSheet");
    }
    this.animations = {};
    this.image = image;
    this.frame = {
      width: frameWidth,
      height: frameHeight,
      margin: frameMargin
    };
    this._f = image.width / frameWidth | 0;
    this.createAnimations(animations);
  }
  /**
   * Create named animations from the sprite sheet. Called from the constructor if the `animations` argument is passed.
   *
   * This function populates the sprite sheets `animations` property with [Animation](api/animation) objects. Each animation is accessible by its name.
   *
   * ```js
   * import { Sprite, SpriteSheet } from 'kontra';
   *
   * let image = new Image();
   * image.src = 'assets/imgs/character_walk_sheet.png';
   * image.onload = function() {
   *
   *   let spriteSheet = SpriteSheet({
   *     image: image,
   *     frameWidth: 72,
   *     frameHeight: 97,
   *
   *     // this will also call createAnimations()
   *     animations: {
   *       // create 1 animation: idle
   *       idle: {
   *         // a single frame
   *         frames: 1
   *       }
   *     }
   *   });
   *
   *   spriteSheet.createAnimations({
   *     // create 4 animations: jump, walk, moonWalk, attack
   *     jump: {
   *       // sequence of frames (can be non-consecutive)
   *       frames: [1, 10, 1],
   *       frameRate: 10,
   *       loop: false,
   *     },
   *     walk: {
   *       // ascending consecutive frame animation (frames 2-6, inclusive)
   *       frames: '2..6',
   *       frameRate: 20
   *     },
   *     moonWalk: {
   *       // descending consecutive frame animation (frames 6-2, inclusive)
   *       frames: '6..2',
   *       frameRate: 20
   *     },
   *     attack: {
   *       // you can also mix and match, in this case frames [8,9,10,13,10,9,8]
   *       frames: ['8..10', 13, '10..8'],
   *       frameRate: 10,
   *       loop: false,
   *     }
   *   });
   * };
   * ```
   * @memberof SpriteSheet
   * @function createAnimations
   *
   * @param {Object} animations - Object of named animations to create from the sprite sheet.
   * @param {Number|String|Number[]|String[]} animations.<name>.frames - The sequence of frames to use from the sprite sheet. It can either be a single frame (`1`), a sequence of frames (`[1,2,3,4]`), or a consecutive frame notation (`'1..4'`). Sprite sheet frames are `0` indexed.
   * @param {Number} animations.<name>.frameRate - The number frames to display per second.
   * @param {Boolean} [animations.<name>.loop=true] - If the animation should loop back to the beginning once completed.
   */
  createAnimations(animations) {
    let sequence, name;
    for (name in animations) {
      let { frames, frameRate, loop } = animations[name];
      sequence = [];
      if (frames == void 0) {
        throw Error(
          "Animation " + name + " must provide a frames property"
        );
      }
      [].concat(frames).map((frame) => {
        sequence = sequence.concat(parseFrames(frame));
      });
      this.animations[name] = factory$b({
        spriteSheet: this,
        frames: sequence,
        frameRate,
        loop
      });
    }
  }
}
function factory$1() {
  return new SpriteSheet(...arguments);
}
const SPEED = 3;
const SCALE = 3;
class KontraEngine extends Engine {
  constructor() {
    super();
  }
  init() {
    const { context: context2 } = init$1();
    this.ctx = context2;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.sprite = new Image();
    this.sprite.src = "spritesheet.png";
    this.sprite.onload = () => {
      this.spritesheet = factory$1({
        image: this.sprite,
        frameWidth: this.texture.width,
        frameHeight: this.texture.height,
        animations: {
          // create a named animation: idle and run
          idle: {
            frames: "0..10",
            // frames 0 through 10
            frameRate: 10,
            loop: true
          },
          run: {
            frames: "11..22",
            // frames 11 through 22
            frameRate: 20,
            loop: true
          }
        }
      });
      this.player = factory$8({
        x: 0,
        y: 0,
        width: this.texture.width * SCALE,
        height: this.texture.height * SCALE,
        anchor: { x: 0.5, y: 0.5 },
        animations: this.spritesheet.animations
      });
      this.player.movement = {
        left: false,
        up: false,
        right: false,
        down: false
      };
      this.scene = factory$2({
        id: "game",
        objects: [this.player]
      });
      this.text = factory$7({
        text: this.getSpriteInfo(),
        font: "32px Arial",
        color: "white",
        x: 15,
        y: 15
      });
      this.camera = { x: this.player.x, y: this.player.y };
      initKeys();
    };
  }
  getSpriteInfo() {
    return `
State: ${this.player.state}
Frame: ${this.player.currentAnimation.frames[0] + this.player.currentAnimation._f}
Pos: ${Math.round(this.player.x)},${Math.round(this.player.y)}`.trim();
  }
  checkKeys() {
    if (keyPressed("arrowleft") || keyPressed("a")) {
      this.player.movement.left = true;
      this.player.facing = 0;
    }
    if (keyPressed("arrowup") || keyPressed("w")) {
      this.player.movement.up = true;
    }
    if (keyPressed("arrowright") || keyPressed("d")) {
      this.player.movement.right = true;
      this.player.facing = 1;
    }
    if (keyPressed("arrowdown") || keyPressed("s")) {
      this.player.movement.down = true;
    }
    if (!(keyPressed("arrowleft") || keyPressed("a"))) {
      this.player.movement.left = false;
    }
    if (!(keyPressed("arrowup") || keyPressed("w"))) {
      this.player.movement.up = false;
    }
    if (!(keyPressed("arrowright") || keyPressed("d"))) {
      this.player.movement.right = false;
    }
    if (!(keyPressed("arrowdown") || keyPressed("s"))) {
      this.player.movement.down = false;
    }
  }
  render() {
    this.loop = GameLoop({
      update: () => {
        if (!this.scene)
          return;
        this.checkKeys();
        this.camera.x = lerp(this.camera.x, this.player.x, 0.03);
        this.camera.y = lerp(this.camera.y, this.player.y, 0.03);
        this.scene.lookAt(this.camera);
        this.player.update();
        let speed = SPEED;
        const movement = Object.values(this.player.movement).filter(
          (v) => v
        ).length;
        if (movement > 1)
          speed *= 0.71;
        if (this.player.movement.left)
          this.player.x -= speed;
        if (this.player.movement.up)
          this.player.y -= speed;
        if (this.player.movement.right)
          this.player.x += speed;
        if (this.player.movement.down)
          this.player.y += speed;
        if (this.player.movement.left) {
          this.player.facing = 0;
          this.player.scaleX = -1;
        } else if (this.player.movement.right) {
          this.player.facing = 1;
          this.player.scaleX = 1;
        }
        if (this.player.state !== "idle" && movement === 0) {
          this.player.state = "idle";
          this.player.playAnimation("idle");
        } else if (this.player.state !== "run" && movement > 0) {
          this.player.state = "run";
          this.player.playAnimation("run");
        }
      },
      render: () => {
        if (this.scene) {
          this.scene.render();
          this.text.render();
          this.text.text = this.getSpriteInfo();
        }
      }
    });
    this.loop.start();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const engine = new KontraEngine();
  engine.init();
  engine.render();
});
