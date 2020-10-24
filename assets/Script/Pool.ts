
const {ccclass, property} = cc._decorator;
export class Rect {

    id: number;

    x: number;
    y: number;

    width: number;
    _height: number;
    poolHeight: number;

    /** rect的能量值 */
    energy: number = 0;

    /** 传播能力 */
    spread: number = 0.8;

    _topCenter: cc.Vec2 = cc.v2();

    public set height(value: number) {
        this._height = value;
        /** 每当rect的高度变化就更新上中顶点 */
        this.updateTopCenter(value);
        
    }
    public get height(): number {
        return this._height;
    }

    constructor(x: number,y: number,width: number,height: number,poolHeight: number) {
        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;
        this.poolHeight = poolHeight;
    }

    public get topCenter(): cc.Vec2 {
        this._topCenter.x = this.x + this.width / 2;
        this._topCenter.y = this.y + this.height;
        return this._topCenter;
    }
    public set topCenter(value: cc.Vec2) {
        this._topCenter = value;
    }
    /** 更新上中顶点 */
    public updateTopCenter(value: number): void {
        let res: cc.Vec2 = cc.v2();
        res.x = this.x + this.width / 2;
        res.y = this.y + value;
        this.topCenter = res;
    }

    public impulse(force: number) {
        this.energy += force;
        /** 400力 增高100px */
        // this.height += force / 4;
    }

    update(dt: number) {
        this.energy *= 0.8;
        this.height += this.energy * dt + (this.poolHeight - this.height) * dt;
    }
}
/**
 * 
 * 水池模拟
 * 
 */
@ccclass
export default class Pool extends cc.Component {

    @property({
        type: cc.Integer,
        tooltip: "将水池宽度分成多少份小矩形",
        displayName: "宽度切分粒度"
    })
    public splitNum: number = 30;
    @property(cc.Boolean)
    public isDebug: boolean = true;
    @property()
    public waterColor: cc.Color = cc.color();

    /** 切分的每个矩形的宽度 */
    private rectWidth: number = 0;
    /** 切分的每个矩形的高度 */
    private rectHeight: number = 0;

    private rects: Rect[] = [];

    private width: number = 0;
    private height: number = 0;

    private brush: cc.Graphics;
    private debugBrush: cc.Graphics;

    onLoad () {
        this.init();
        this.initRects();
    }
    private init(): void {
        this.width = this.node.width;
        this.height = this.node.height;
        
        let ratio = cc.view.getVisibleSize().width / cc.view.getDesignResolutionSize().width;
        this.node.scaleX = ratio;
        this.node.scaleY = ratio;
        this.rectWidth = this.width / (this.splitNum - 1);
        this.rectHeight = this.height;
        if(!this.brush) {
            this.brush = this.node.addComponent(cc.Graphics);
        }
        this.node.on(cc.Node.EventType.TOUCH_START,this.impulse,this);

        if(this.isDebug) {
            let debugNode: cc.Node = new cc.Node();
            /** 添加调试画笔 */
            this.debugBrush = debugNode.addComponent(cc.Graphics);
            this.node.addChild(debugNode);
        }
        
    }
    /** 激发一个冲动 */
    private impulse(event: cc.Event.EventTouch): void {
        let pos: cc.Vec2 = event.getLocation();
        let localPos: cc.Vec2 = this.node.convertToNodeSpace(pos);

        let rect: Rect = this.getRectAt(localPos.x);
        console.log("rect is ",rect.id);
        let ratio: number = localPos.y / this.node.height;
        /** 当前rect激发一个400的力 */
        rect.impulse(1200 * ratio * 0.5);
        this.impactOtherRect(rect);

    }
    /**
     * @param  {Rect} source 力的源头
     * @returns void
     */
    impactOtherRect(source: Rect): void {
        /** 找到rect序列的索引位置 */
        let id = source.id;
        /** 影响左边右边 */
        for(let i = id - 1; i >= 0; i--) {
            let preRect: Rect = this.rects[i + 1];
            let curRect: Rect = this.rects[i];

            curRect.energy += preRect.energy * source.spread;
        }
        for(let j = id + 1; j < this.rects.length; j++) {
            let preRect: Rect = this.rects[j - 1];
            let curRect: Rect = this.rects[j];

            curRect.energy += preRect.energy * source.spread;
            
        }
        // for(let m = 0,len = this.rects.length; m < len; m++) {
        //     console.log(`${m}'s energy is `,this.rects[m].energy);
        // }

    }

    private initRects(): void {
        this.rects = [];
        let offsetX: number = this.rectWidth / 2;
        let startX: number = 0 - offsetX;
        let startY: number = 0;

        for(let i = 0; i < this.splitNum; i++) {
            let x: number = startX + i * this.rectWidth;
            let y: number = 0;

            let rect: Rect = new Rect(x,y,this.rectWidth,this.rectHeight,this.node.height);
            this.rects.push(rect);
            rect.id = i;

        }

    }
    private drawDebug(dt: number): void {
        this.debugBrush.clear();
        for(let i = 0; i < this.rects.length; i++) {

            


            /** 绘制轮廓开始 */
            let rect: Rect = this.rects[i];
            this.debugBrush.strokeColor = cc.Color.MAGENTA.setA(200);
            this.debugBrush.rect(rect.x,rect.y,rect.width,rect.height);
            this.debugBrush.stroke();

            /** 绘制每个水带的上中定点 */
            this.debugBrush.fillColor = cc.Color.WHITE;
            this.debugBrush.moveTo(rect.topCenter.x,rect.topCenter.y);
            this.debugBrush.circle(rect.topCenter.x,rect.topCenter.y,5);
            this.debugBrush.fill();
            // this.debugBrush.stroke();
            /** 绘制rect中心点的连线 */
            this.debugBrush.strokeColor = cc.Color.GREEN;
            this.debugBrush.moveTo(rect.topCenter.x,rect.topCenter.y);
            this.debugBrush.lineTo(rect.x + this.rectWidth / 2,0);
            this.debugBrush.stroke();
            /** 绘制轮廓结束 */
        }
    }

    /** 获取到制定位置上的rect */
    private getRectAt(x: number): Rect {
        for(let rect of this.rects) {
            if(x >= rect.x && x <= rect.x + rect.width) {
                return rect;
            }
        }
    }

    /** 绘制波浪 */
    private drawWave(dt: number): void {
        if(this.brush && this.rects.length > 0) {
            this.brush.clear();
            let firstRect: Rect = this.rects[0];
            this.brush.fillColor = this.waterColor;
            this.brush.moveTo(firstRect.x,firstRect.y);
            this.brush.lineTo(firstRect.topCenter.x,firstRect.topCenter.y)
            let i = 1;
            for(; i < this.rects.length - 1; i++) {
                let rectItem: Rect = this.rects[i];
                this.brush.quadraticCurveTo(rectItem.topCenter.x - rectItem.width / 2,rectItem.topCenter.y,rectItem.topCenter.x,rectItem.topCenter.y);
            }
            
            let lastRect: Rect = this.rects[i];
            this.brush.quadraticCurveTo(lastRect.topCenter.x - lastRect.width / 2,lastRect.topCenter.y,lastRect.topCenter.x,lastRect.topCenter.y);

            this.brush.lineTo(this.node.width,0);
            this.brush.lineTo(0,0);
            this.brush.close();
            this.brush.fill();

        }
    }
    update (dt) {
        this.drawWave(dt);
        this.rects.forEach((element) => {
            element.update(dt);
        })
        if(this.isDebug) {
            this.drawDebug(dt);
        }
    }
}
