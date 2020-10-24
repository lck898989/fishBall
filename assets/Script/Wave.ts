
type V2 = {x: number,y: number}
type Rect = V2 & {width: number;height: number}

class Strip {
    public rect: Rect;
    public pos: V2 = {x: 0,y: 0};
    public energy = 0;

    public constructor(rect: Rect) {
        this.rect = rect;
        this.updatePos();
    }
    public get width() {
        return this.rect.width;
    }

    public get height() {
        return this.rect.height;
    }

    public set height(height: number) {
        this.rect.height = height;
        this.updatePos();
    }

    public get x() {
        return this.pos.x;
    }
    public get y() {
        return this.pos.y;
    }

    private updatePos() {
        this.pos.x = this.rect.x + this.rect.width / 2;
        this.pos.y = this.rect.y + this.rect.height;
    }
}
type StripsManagerContext = {
    targetWidth: number;
    targetOffsetX: number;
    targetOffsetY: number;
    height: number;
    n: number;
    spread: number;
    propagation: number;
    initialHeights: number[]
};
class StripsManager {
    public context: StripsManagerContext;
    public strips: Strip[] = [];

    public constructor(context: StripsManagerContext,brush: cc.Graphics) {
        this.context = context;

        const stripWidth = this.context.targetWidth / (this.context.n - 1);

        for(let i = 0; i < this.context.n; i++) {
            let initialHeight = this.context.initialHeights[i];

            if(typeof initialHeight !== 'number') {
                initialHeight = this.context.height;
            }
            let x = stripWidth * i - stripWidth / 2 + this.context.targetOffsetX;
            const strip = new Strip({
                x: x,
                y: this.context.targetOffsetY,
                width: stripWidth,
                height: initialHeight,
            });
            console.log(`${i} ==> 's x is ${x} and y is ${this.context.targetOffsetY}`);
            // brush.moveTo(x,this.context.targetOffsetY);
            // brush.circle(x,this.context.targetOffsetY,10);
            // brush.fillColor = cc.Color.WHITE;
            // brush.fill();

            this.strips.push(strip);
        }
    }

    /** 激活一个脉冲 */
    public impulse(x: number,force: number) {
        const strip = this.getStripAt(x);
        if(strip) {
            strip.energy += force;
        }
    }

    public pushTo(x: number,height: number) {
        const strip = this.getStripAt(x);

        if(strip) {
            strip.height = height;
        }
    }

    public getStripAt(x: number) {
        for(let strip of this.strips) {
            if(x >= strip.rect.x && x < strip.rect.x + strip.rect.width) {
                return strip;
            }
        }
    }

    public update(dt: number) {
        for(let k = 0; k < this.context.propagation; k++) {
            for(let i = 0; i < this.strips.length; i++) {
                let thisStrip = this.strips[i];
                if(i > 0) {
                    let leftStrip = this.strips[i - 1];
                    /** 脉冲向左传播 */
                    leftStrip.energy += this.context.spread * (thisStrip.height - leftStrip.height);
                }
                if(i < this.strips.length - 1) {
                    let rightStrip = this.strips[i + 1];
                    /** 脉冲向右传播 */
                    rightStrip.energy += this.context.spread * (thisStrip.height - rightStrip.height);
                }
            }
        }

        for(let strip of this.strips) {
            strip.energy *= this.context.spread;
            // console.log("energy is ",strip.energy);
            strip.height += strip.energy * dt + (this.context.height - strip.height) * dt;
            // console.log("strip's height is ",strip.height);
        }
    }
}
const {ccclass, property} = cc._decorator;

@ccclass
export default class Wave extends cc.Component {

    private time: number = 0;
    private timeInterval: number = 0.5;

    @property(cc.Node)
    public target: cc.Node = null;

    public get targetWidth() {
        return this.target.width;
    }

    public get targetOffsetX() {
        return -this.target.anchorX * this.target.width;
    }

    public get targetOffsetY() {
        return -this.target.anchorY * this.target.height;
    }
    @property(cc.Boolean)
    public useMask = true;

    private graphics: cc.Graphics;

    @property(cc.Boolean)
    public debug = false;

    private debugNode: cc.Node;
    private debugGraphics: cc.Graphics;

    @property({
        type: cc.Float,
        tooltip: "the height of the surface of the wave",
        min: 0
    })
    public height = 80;

    @property({
        type: cc.Integer,
        displayName: "Number",
        tooltip: "the number of strips,become immutable once set before load",
        range: [0,100,1],
    })
    public n = 20;

    @property({
        type: cc.Float,
        tooltip: "the spread factore of delta wave energy",
        range: [0,1,0.001],
    })
    public spread = 0.98;

    @property({
        type: cc.Integer,
        tooltip: 'the propagation iteration times',
        range: [1,10,1],
    })
    public propagation = 1;
    @property({
        type: cc.Float,
        tooltip: "每个波浪的初始化高度，如果没有设置默认是水面的高度",
        min: 0
    })
    public initialHeights: number[] = [];

    @property({
        tooltip: "颜色的变化率",
    })
    public gradientColor = cc.color();

    @property({
        type: cc.Float,
        tooltip: '颜色变化率的值，默认为0',
        min: 0
    })
    public gradientHeight = 10;

    public stripsManager: StripsManager;

    // private time: number = 0
    private times: number = 0;
    
    onLoad () {
        if(this.n < 2) {
            throw new Error("n must be 2 at minimum");
        }
        if(!this.target) {
            this.target = this.node;
        }

        this.graphics = this.useMask ? this.target.addComponent(cc.Mask)['_graphics'] : this.target.addComponent(cc.Graphics);

        this.stripsManager = new StripsManager(this,this.graphics);

        this.node.on(cc.Node.EventType.TOUCH_END,this.createImpulse,this);
    }

    /** 制造一个冲击波 */
    private createImpulse(event: cc.Event.EventTouch): void {
        let pos: cc.Vec2 = event.getLocation();
        let localPos: cc.Vec2 = this.node.convertToNodeSpaceAR(pos);

        this.stripsManager.impulse(localPos.x,800);
    }
    start () {

    }

    update (dt) {
        this.stripsManager.update(dt);
        // this.time += dt;
        // if(this.time < this.timeInterval) {
        //     return;
        // }
        this.time = 0;
        // if(!this.times) {
        //     this.stripsManager.impulse(Math.floor(Math.random() * this.n),dt * 2000);
        // }
        this.paintStripCurve();
        this.paintDebug();
    }
    /**
     * 在某个位置激发冲动波
     * @param x 
     * @param force 
     */
    public impulse(x: number,force: number) {
        this.stripsManager.impulse(x,force);
    }

    public pushTo(x: number,height: number) {
        this.stripsManager.pushTo(x,height);
    }

    public getStripAt(x: number) {
        return this.stripsManager.getStripAt(x);
    }

    private paintStripCurve() {
        this.graphics.clear();
        /** 绘制轮廓开始 */
        let {strips} = this.stripsManager;

        const [{x: x0,y: y0}] = strips;

        this.graphics.fillColor = this.target.color.clone().setA(this.target.opacity);

        this.graphics.moveTo(x0,y0);

        let i = 1;

        for(; i < strips.length - 2; i++) {
            let {x: x1,y: y1} = strips[i];
            let {x: x2,y: y2} = strips[i + 1];

            this.graphics.quadraticCurveTo(x1,y1,(x1 + x2) / 2,(y1 + y2) / 2);
        }
        const {x: x1,y: y1} = strips[i];
        const {x: x2,y: y2} = strips[i + 1];
        this.graphics.quadraticCurveTo(x1,y1,(x1 + x2) / 2,(y1 + y2) / 2);
        this.graphics.quadraticCurveTo(x2,y2,(x1 + x2) / 2,(y1 + y2) / 2);

        this.graphics.lineTo(this.target.width + this.targetOffsetX,this.height + this.targetOffsetY);
        this.graphics.lineTo(this.target.width + this.targetOffsetX,this.targetOffsetY);

        this.graphics.lineTo(this.targetOffsetX,this.targetOffsetY);

        this.graphics.close();
        this.graphics.fill();
        this.graphics.lineWidth = 1;
        /****  绘制轮廓结束   */

        let offsetY = 0;

        if(!this.useMask) {
            for(; offsetY > -this.gradientHeight; offsetY--) {
                this.graphics.strokeColor = this.getColorGradient(offsetY / -this.gradientHeight);
            }
            this.graphics.strokeColor.setA(255);
            this.graphics.moveTo(x0,y0 + offsetY);
            let i = 1;

            for(; i < strips.length - 2; i++) {
                let {x: x1,y: y1} = strips[i];
                let {x: x2,y: y2} = strips[i + 1];

                y1 += offsetY;
                y2 += offsetY;

                this.graphics.quadraticCurveTo(x1,y1,(x1 + x2) / 2,(y1 + y2) / 2);

            }

            let {x: x1,y: y1} = strips[i];
            let {x: x2,y: y2} = strips[i + 1];

            y1 += offsetY;
            y2 += offsetY;

            this.graphics.quadraticCurveTo(x1,y1,x2,y2);
            this.graphics.stroke();
        }
    }

    private getColorGradient(r: number) {
        return this.gradientColor.lerp(this.target.color.clone().setA(0),r);
    }

    private paintDebug() {
        if(this.debug) {
            if(!cc.isValid(this.debugNode)) {
                this.debugNode = new cc.Node("MaskWave Debug");
                this.debugNode.setAnchorPoint(this.target.getAnchorPoint());
                this.debugNode.position = this.target.position;
                this.debugNode.width = this.target.width;
                this.debugNode.height = this.target.height;

                this.debugGraphics = this.debugNode.addComponent(cc.Graphics);
                this.target.parent.addChild(this.debugNode);
            }

            this.debugGraphics.clear();
            this.debugGraphics.fillColor = cc.Color.RED;

            let {strips} = this.stripsManager;

            for(let strip of strips) {
                this.debugGraphics.strokeColor = cc.Color.MAGENTA;
                this.debugGraphics.lineWidth = 1;
                const {x,y,rect} = strip;

                this.debugGraphics.rect(rect.x,rect.y,rect.width,rect.height);
                this.debugGraphics.stroke();

                this.debugGraphics.strokeColor = cc.Color.GREEN;

                this.debugGraphics.lineWidth = 2;

                this.debugGraphics.moveTo(x,rect.y);
                this.debugGraphics.lineTo(x,y);
                this.debugGraphics.close();
                this.debugGraphics.stroke();

                this.debugGraphics.fillRect(x - 2,y - 2,4,4);
            }
        } else {
            if(cc.isValid(this.debugNode)) {
                this.debugNode.destroy();
            }
        }
    }
}
