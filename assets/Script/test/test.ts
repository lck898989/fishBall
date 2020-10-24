// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({type: cc.Node})
    testNode: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {  
        let testsNode: cc.Node = this.testNode.getChildByName("testNode");

        let testNodeWP: cc.Vec2 = this.testNode.parent.convertToWorldSpaceAR(this.testNode.getPosition());

        console.log("testNodeWP is ",testNodeWP);

        let testsNodeWP: cc.Vec2 = this.testNode.convertToWorldSpaceAR(testsNode.getPosition());
        console.log("testsNodeWp is ",testsNodeWP);

    }

    // update (dt) {}
}
