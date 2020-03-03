import Ball from "./Ball";
import LaunchBall from "./LaunchBall";
import Util from "./Util";

const {ccclass, property} = cc._decorator;
enum GameState {
    INIT,
    BEGIN,
    END
}
/***
 * 
 * 
 * 附件资源没有，图是我自己找来的，丑到你们请见谅谢谢！！
 * 附件资源没有，图是我自己找来的，丑到你们请见谅谢谢！！
 * 附件资源没有，图是我自己找来的，丑到你们请见谅谢谢！！
 * 
 * 
 */
@ccclass
export default class Game extends cc.Component {
    @property({type: cc.Prefab})
    ballPrefab: cc.Prefab = null;
    // 节点池的深度
    @property({
        type: cc.Integer,
        displayName: "节点池深度",
        min: 0,
        max: 100
    })
    poolDeep = 10;
    @property({
        type: cc.Node
    })
    ballCon: cc.Node = null;
    @property({type: cc.Node})
    redBallOne: cc.Node = null;
    @property({type: cc.Node})
    redBallTwo: cc.Node = null;
    @property({type: cc.Node})
    overNode: cc.Node = null;

    private readonly zeroCode: number = 48;
    // 关卡配置文件数据
    private levelData: Object = {};
    // 用于盛放实例出来的预制体节点的节点池用于关卡之间切换重复利用
    private ballPool: cc.NodePool = null;
    // 游戏状态
    private _curState: GameState = GameState.INIT;

    // 待发射的小球数组
    private waitLaunchBallArr: cc.Node[] = [];
    // 记录发射小球的起始位置
    private startPoint: cc.Vec2 = new cc.Vec2(0,0);
    // private endPoint: cc.Vec2 = new cc.Vec2();
    // 当前两个小球的总和
    private totalScore: number = 0;

    // 存放node节点的对象
    private nodeMap: cc.Node[] = [];

    onLoad() {
        // 最开始开启物理系统
        cc.director.getPhysicsManager().enabled = true;
    }
    async start () {
        let data: cc.JsonAsset = await this.loadConfig();
        this.levelData = data.json;
        let self = this;
        this.curState = GameState.INIT;
        let dataArr:number[] = <number[]>this.levelData[1];
        // 初始化小球
        for(let i = 0; i < dataArr.length; i++) {
            let ballItem: cc.Node = self.ballPool.get();
            console.log("index is ",i);
            if(i === 0) {
                this.setBallInitPosition(ballItem,this.ballCon,dataArr[i]);
            } else {
                this.setBallInitPosition(ballItem,this.ballCon,dataArr[i]);
                await new Promise((resolve,reject) => {
                    let id = setTimeout(() => {
                        if(ballItem) {
                        }
                        resolve();
                        clearInterval(id);
                    },200);
                });
            }
        }
        // 球下落完毕后开始游戏
        this.curState = GameState.BEGIN;

    }
    // 设置小球的出生位置
    /**
     * @param  {cc.Node} ballItem 通过预制体生成出来的节点
     * @param  {cc.Node} parent 生成出来的节点添加到哪个节点上
     * @param  {number} index 该小球内部所表示的数字
     * @returns void
     */
    private setBallInitPosition(ballItem: cc.Node,parent: cc.Node,index: number): void {
        let ballCom: Ball = <Ball>ballItem.getComponent("Ball");
        ballCom.setNumberString(index);
        let realBall: cc.Node = ballItem.getChildByName("circle");
        // ballItem.parent = parent;
        let x: number = Util.createRandom(realBall.width / 2,this.ballCon.width - realBall.width / 2);
        let y: number = this.ballCon.height - realBall.height;
        ballItem.setPosition(cc.v2(x,y));
        parent.addChild(ballItem);
        this.nodeMap.push(ballItem);
    }
    // 设置游戏状态
    set curState(state: GameState) {
        let self = this;
        switch(state) {
            case GameState.INIT:
                this._curState = GameState.INIT;
                this.init();
                break;
            case GameState.BEGIN:
                this._curState = GameState.BEGIN;
                break;
            case GameState.END:
                this._curState = GameState.END;
                console.log("游戏结束");
                if(!this.overNode.active) {
                    this.overNode.active = true;
                    this.overNode.getComponent(cc.Animation).play("over");
                    setTimeout(() => {
                        self.overNode.getComponent(cc.Animation).play("over2");
                    },500);
                }
                break;        
        }
    }
    private init(): void {
        this.nodeMap = [];
        // 存储发射小球的起始位置
        this.startPoint.x = this.redBallTwo.x;
        this.startPoint.y = this.redBallTwo.y;
        this.totalScore = 0;

        this.ballPool = new cc.NodePool();
        this.initNodePool();
        this.waitLaunchBallArr = [];
        this.overNode.active = false;
        // 注册键盘事件
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        // cc.tween(this.redBallTwo).to(1,{
        //     x: -160,
        //     y: 220
        // }).start();
    }
    // 键盘按下
    private async onKeyDown(event: cc.Event.EventKeyboard) {
        if(this._curState === GameState.BEGIN) {
            let self = this;
            let key: number = event.keyCode;
            let realIndex: number = key - this.zeroCode;
            console.log("key is ",key);
            let number = 0;
            if(realIndex > 0 && realIndex < 10) {
                number = key;
                // 生成发射小球
                let moveNode: cc.Node = null;
                let len: number = 0;
                self.totalScore += realIndex;
                if(self.waitLaunchBallArr.length === 0) {
                    self.waitLaunchBallArr.push(self.redBallOne);
                    len = self.waitLaunchBallArr.length;
                    moveNode = self.waitLaunchBallArr[len - 1];
                    // let numberLabel: cc.Label = <cc.Label>moveNode.getChildByName("number").getComponent(cc.Label);
                    let moveCom: LaunchBall = <LaunchBall>moveNode.getComponent("LaunchBall");
                    moveCom.setNumberString(realIndex);
                    // moveCom.startMove();
                    self.computerScore();
                    
                    self.tweenMove(moveNode,-160,220,() => {
    
                    },'backInOut');
                } else {
                    if(self.waitLaunchBallArr.length < 2) {
                        self.waitLaunchBallArr.push(self.redBallTwo);
                        len = self.waitLaunchBallArr.length;
                        moveNode = self.waitLaunchBallArr[len - 1];
                        let moveCom: LaunchBall = <LaunchBall>moveNode.getComponent("LaunchBall");
                        moveCom.setNumberString(realIndex);
                        // moveCom.startMove();
                        self.computerScore();
                        self.tweenMove(moveNode,160,220,() => {
    
                        },"backInOut");
                    }
                    
                }
            }
            switch(key) {
                case 8:
                case 27:
                    // esc键
                    let len: number = this.waitLaunchBallArr.length;
                    // backspace键
                    if(len >= 1) {
                        let lastNode: cc.Node = <cc.Node>this.waitLaunchBallArr.splice(len - 1,1)[0];
                        let moveCom: LaunchBall = <LaunchBall>lastNode.getComponent("LaunchBall");
                        if(self.totalScore > 0) {
                            self.totalScore -= moveCom.getNumberString();
                            if(self.waitLaunchBallArr.length === 0) {
                                self.totalScore = 0;
                            }
                        }
                        console.log("totalScore is ",self.totalScore);
                        console.log();
                        this.tweenMove(lastNode,self.startPoint.x,self.startPoint.y,() => {
                            
                        },'backInOut');
                    }
                    break;    
            }
        }
    }
    /**
     * 执行tween动画
     * @param  {cc.Node} node 目标节点
     * @param  {number} x 变换到的x坐标
     * @param  {number} y 变换到的y坐标
     * @param  {Function} callback 变换执行完毕后的回调函数
     * @param  {string} easeString 缓动动画的类型
     */
    private tweenMove(node: cc.Node,x: number,y: number,callback: Function,easeString: string) {
        cc.tween(node).to(0.5,{x,y},{progress: null,easing: easeString}).call(callback).start();
    }
    // 计算分数进行消除
    private async computerScore() {
        
        let self = this;
        let removeNodes: cc.Node[] = this.getBallByScore();
        console.log("removeNodes is ",removeNodes);
        for(let i = 0; i < removeNodes.length; i++) {
            let removeNode: cc.Node = removeNodes[i];
            if(removeNode) {
                removeNode.getComponent(cc.Animation).play();
                await new Promise((resolve,reject) => {
                    let id = setTimeout(() => {
                        cc.tween(removeNode).to(1,{
                            opacity: 0
                        },{progress: null,easing: "easeInOut"}).call(() => {
                            // 清除map的内容
                            // self.nodeMap[self.totalScore] = null;
                            removeNode.destroy();
                            clearTimeout(id);
                            resolve();
                        }).start();
                    },200);
                });
            } else {
                return null;
            }
        }
    }
    // 找出分数和上面的球上面的数字相等的节点
    private getBallByScore(): cc.Node[] {
        let self = this;
        let res = [];
        if(self.nodeMap && self.nodeMap.length > 0) {
            let i = self.nodeMap.length - 1;
            // 如果是找到数组的最开头就退出
            while(i >= 0) {
                let lastIndex: number = i;
                let lastItem: cc.Node = self.nodeMap[lastIndex];
                let lastItemBall: Ball = <Ball>lastItem.getComponent("Ball");
                if(lastItemBall.getNumberString() === self.totalScore) {
                    res.push(lastItem);
                    self.nodeMap.splice(lastIndex,1);
                    i = self.nodeMap.length;
                }
                i--;
            }
        }
        return res;
    }
    // 键盘抬起
    private onKeyUp(event: cc.Event.EventKeyboard): void {

    }
    // 初始化节点池
    private initNodePool(): void {
        for(let i = 0; i < this.poolDeep; i++) {
            let nodeItem: cc.Node = cc.instantiate(this.ballPrefab);
            let width = Util.createRandom(80,150);
            let realBallNode: cc.Node = nodeItem.getChildByName("circle");
            realBallNode.width = width;
            realBallNode.height = width;
            nodeItem.getComponent(cc.PhysicsCircleCollider).radius = width / 2;
            this.ballPool.put(nodeItem);
        }
    }
    // 加载关卡的配置文件
    private async loadConfig(): Promise<cc.JsonAsset> {
        return new Promise((resolve,reject) => {
            cc.loader.loadRes("config/level.json",cc.JsonAsset,(err,res) => {
                if(err) {
                    reject();
                }
                resolve(res);
            })
        })
    }
    update() {
        if(this.ballCon.childrenCount === 0 && this._curState !== GameState.INIT) {
            // 游戏结束
            this.curState = GameState.END;
        }
    }
    onDestroy(): void {
        // 注销键盘监听事件
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        this.nodeMap = [];
    }
}
