const w : number = window.innerWidth, h : number = window.innerHeight
class SlackLineStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D
    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage = new SlackLineStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0
    update(cb : Function) {
        this.scale += 0.034 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number
    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

const nodes : number = 5

class SLNode {
    prev : SLNode
    next : SLNode
    state : State = new State()
    constructor(private i : number) {

    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new SLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        context.strokeStyle = 'teal'
        context.lineWidth = Math.min(w, h) / 50
        context.lineCap = 'round'
        const sc1 = Math.min(0.33, this.state.scale)
        const sc2 = Math.min(0.33, Math.max(0, this.state.scale - 0.33))
        const sc3 = Math.min(0.33, Math.max(0, this.state.scale - 0.66))
        const gap = w / nodes
        const size = gap / 2
        context.save()
        context.translate(this.i * gap + gap / 2, h/2)
        for (var i = 0; i < 2; i++) {
            context.save()
            context.rotate(Math.PI/2 * sc2)
            for (var j = 0; j < 2; j++) {
                context.save()
                context.translate((1 - 2 * i) * size/2 * sc1, 0)
                context.beginPath()
                context.moveTo(0, -size/2 * sc3)
                context.lineTo(0, size/2 * sc3)
                context.stroke()
                context.restore()
            }
            context.restore()
        }
        context.restore()
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : SLNode {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedSL {

    curr : SLNode = new SLNode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
