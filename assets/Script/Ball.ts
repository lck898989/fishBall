import Util from "./Util";

const {ccclass, property} = cc._decorator;
// 小球对应的类
@ccclass
export default class Ball extends cc.Component {

    // onLoad () {}
    @property({type: cc.Label})
    numLabel: cc.Label = null;


    
    // 刚体组件
    private ballRigidBody: cc.RigidBody = null;

    start () {
        // 设置球的大小
        this.ballRigidBody = <cc.RigidBody>this.node.getComponent(cc.RigidBody);
        this.ballRigidBody.gravityScale = 10;
        this.ballRigidBody.linearVelocity = cc.v2(0,100);
        
        // this.ballRigidBody

    }
    getNumberString(): number {
        return Number(this.numLabel.string);
    }
    setNumberString(num: number): void {
        this.numLabel.string = num.toString();
    }
    update (dt) {

    }
}
