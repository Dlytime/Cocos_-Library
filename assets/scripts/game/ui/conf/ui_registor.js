import UIRegisterInfos from "./ui_registor_base"

var _UIRegisterInfos = [
  // {
  //   // 关键字，全局唯一
  //   key: "tips",
  //   // z方向排序顺序，view：10-100，弹出窗：101-799, 广告窗800-999
  //   zIndex: 999,
  //   // 隐藏后是否销毁
  //   isAutoDestory: false,
  //   // 管理类名，需继承自base_popup
  //   cls: "Tips",
  //   // 预制体位置
  //   prefab: "prefab/tipsView.json"
  // }
]

// 添加到UIRegisterInfos
_UIRegisterInfos.forEach(function( _UIRegisterInfo ) {
  UIRegisterInfos.push(_UIRegisterInfo)
})

// export
export {UIRegisterInfos as default}