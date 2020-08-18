var UIRegisterInfos = [
  {
    // 关键字，全局唯一
    key: "tips",
    // z方向排序顺序，view：10-100，弹出窗：101-799, 广告窗800-999
    zIndex: 999,
    // 隐藏后是否销毁
    isAutoDestory: false,
    // 管理类名，需继承自base_popup
    cls: "Tips",
    // 预制体位置
    prefab: "prefab/Tips"
  },
  {
    // 关键字，全局唯一
    key: "insertAd",
    // z方向排序顺序，view：10-100，弹出窗：101-799, 广告窗800-999
    zOrder: 887,
    // 隐藏后是否销毁
    isAutoDestory: false,
    // 管理类名，需继承自base_popup
    cls: "InsertAd",
    // 预制体位置
    prefab: "prefab/InsertAd"
  },
  {
    // 关键字，全局唯一
    key: "setting",
    // z方向排序顺序，view：10-100，弹出窗：101-799, 广告窗800-999
    zOrder: 101,
    // 隐藏后是否销毁
    isAutoDestory: false,
    // 管理类名，需继承自base_popup
    cls: "Setting",
    // 预制体位置
    prefab: "prefab/Setting"
  }
]

// export
export {UIRegisterInfos as default}