var w = window.innerWidth, h = window.innerHeight;
var SlackLineStage = (function () {
    function SlackLineStage() {
        this.canvas = document.createElement('canvas');
        this.linkedSL = new LinkedSL();
        this.animator = new Animator();
        this.initCanvas();
    }
    SlackLineStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    SlackLineStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.linkedSL.draw(this.context);
    };
    SlackLineStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.linkedSL.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.linkedSL.update(function () {
                        _this.animator.stop();
                    });
                });
            });
        };
    };
    SlackLineStage.init = function () {
        var stage = new SlackLineStage();
        stage.render();
        stage.handleTap();
    };
    return SlackLineStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.prevScale = 0;
        this.dir = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += 0.034 * this.dir;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(function () {
                cb();
            }, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var nodes = 5;
var SLNode = (function () {
    function SLNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    SLNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new SLNode(this.i + 1);
            this.next.prev = this;
        }
    };
    SLNode.prototype.draw = function (context) {
        context.strokeStyle = 'teal';
        context.lineWidth = Math.min(w, h) / 50;
        context.lineCap = 'round';
        var sc1 = Math.min(0.33, this.state.scale) * 3;
        var sc2 = Math.min(0.33, Math.max(0, this.state.scale - 0.33)) * 3;
        var sc3 = Math.min(0.33, Math.max(0, this.state.scale - 0.66)) * 3;
        var gap = w / nodes;
        var size = gap / 2;
        context.save();
        context.translate(this.i * gap + gap / 2, h / 2);
        for (var i = 0; i < 2; i++) {
            context.save();
            context.rotate(Math.PI / 2 * (1 - sc2) * i);
            for (var j = 0; j < 2; j++) {
                context.save();
                context.translate((1 - 2 * j) * size / (4) * (1 - sc1), 0);
                context.beginPath();
                context.moveTo(0, -size / 2 * (1 - sc3));
                context.lineTo(0, size / 2 * (1 - sc3));
                context.stroke();
                context.restore();
            }
            context.restore();
        }
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    SLNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    SLNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    SLNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return SLNode;
})();
var LinkedSL = (function () {
    function LinkedSL() {
        this.curr = new SLNode(0);
        this.dir = 1;
    }
    LinkedSL.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    LinkedSL.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedSL.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedSL;
})();
