const { goodsData } = require('./data.js')
const systemInfo = wx.getSystemInfoSync()

// 列数
const COLUMN = 2;
let j = 1
let pageIndex = 1;

let minHeight = 0;
let minIndex = 0;
let heightArr = [];

// 提交wx.createRecycleContext能力
const createRecycleContext = require('../../components/index.js')

Page({
  data: {
    maxHeight: systemInfo.windowHeight,
    // placeholderImage: "data:image/svg+xml,%3Csvg height='140rpx' test='132rpx' width='100%25' xmlns='http://www.w3.org/2000/svg'%3E %3Crect width='50%25' x='40' height='20%25' style='fill:rgb(204,204,204);' /%3E %3C/svg%3E"
  },
  onLoad: function () {
    var ctx = createRecycleContext({
      column: COLUMN,
      displayMode: 'flow',
      id: 'recycleFlowId',
      dataKey: 'recycleFlowList',
      page: this,
      itemSize: function({ width, height }) {
        return { width, height };
      },
      placeholderClass: ['recycle-image', 'recycle-text'],
      useInPage: true,
      root: this
    })
    this.ctx = ctx;
    this.showView()
  },
  onUnload: function () {
    this.ctx.destroy()
    this.ctx = null
  },
  onReady() {
    // this.showView()
  },

  genData: function() {
    // 构造数据
    let newData = []
    for (var i = 0; i < 19; i++) {
      var newItem = Object.assign({}, { ...goodsData })
      newData.push(newItem)
    }

    const newList = []
    newData.forEach((item, i) => {
      const newItem = Object.assign({}, item);
      newItem.id = j++;

      /// 定义块 width/height
      newItem.width = systemInfo.windowWidth / COLUMN;
      newItem.height = 100 + Math.floor(Math.random() * newItem.width);
      // newItem.height = i % 3 === 1 ? 160 : 100;
      // newItem.height = 160;

      if (i < COLUMN && pageIndex === 1) {
        heightArr.push(newItem.height);
        newItem.top = 0;
        newItem.left = newItem.width * i;
      } else {
        minHeight = Math.min(...heightArr);
        minIndex = heightArr.findIndex(height => height === minHeight);
        heightArr[minIndex] += newItem.height;

        newItem.top = minHeight;
        newItem.left = newItem.width * minIndex;
      }

      // 注意 left/top 单位是 px
      newItem.style = getInlineStyle(newItem);
      newList.push(newItem)
    })
    return newList
  },
  showView: function () {
    const ctx = this.ctx
    const newList = this.genData()
    // API的调用方式
    console.log('len', newList.length)
    const st = Date.now()
    // ctx.splice(0, 0, newList, function() {
    //   // 新增加的数据渲染完毕之后, 触发的回调
    //   console.log('【render】use time', Date.now() - st)
    // })
    ctx.splice(newList, () => {
      // 新增加的数据渲染完毕之后, 触发的回调
      console.log('【render】deleteList use time', Date.now() - st)
      // this.setData({
      //   scrollTop: 1000
      // })
    })
    console.log('transformRpx', ctx.transformRpx(123.5))
  },
  itemSizeFunc: function (item) {
    return {
      width: 162,
      height: 182
    }
  },
  onPageScroll: function() {}, // 一定要留一个空的onPageScroll函数
  onReachBottom: function() {
    console.log('【【【【trigger onReachBottom');
  }, /// useInPage: true 时 分页加载数据
  scrollToLower(e) {
    // return;
    // 延迟1s，模拟网络请求
    if (this.isScrollToLower) return
    // console.log('【【【【trigger scrollToLower')
    this.isScrollToLower = true
    pageIndex++;
    setTimeout(() => {
      console.log('【【【【exec scrollToLower')
      const newList = this.genData()
      console.log('this.pageInde', pageIndex)
      this.ctx.append(newList, () => {
        this.isScrollToLower = false
      })
    }, 1000)
  },

  toIndex() {
    wx.navigateTo({
      url: '/pages/index/index'
    })
  },
  getScrollTop: function() {
    console.log('getScrollTop', this.ctx.getScrollTop())
  },
})

function getInlineStyle({ height, width, left, top }, unit = 'px') {
  return `position: absolute; height: ${height}${unit}; width: ${width}${unit}; left: ${left}${unit}; top: ${top}${unit};`
}