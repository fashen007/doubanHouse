// 服务启动
// 服务启动
// 服务启动
const express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); 
const app = express();
let server = app.listen(2333, "127.0.0.1", function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Your App is running at' + host + ':' + port, );
})
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
// 插件
// 插件
// 插件
const superagent = require('superagent');
const eventproxy = require('eventproxy');
var request = require('request');
// const ipProxy = require('ip-proxy-pool');
const cheerio = require('cheerio');
const async = require('async');
require('superagent-proxy')(superagent);
var ObjectId = require('mongodb').ObjectID

// 爬虫基本配置，后续可以从界面端传进来
const groups = require('./server/urls') // 租房小组的url,
let page = 1 // 抓取页面数量
let start = 24  // 页面参数拼凑

// 构造爬虫ulr
let ep = new eventproxy()  //  实例化eventproxy
global.db = require('./server/db')
let allLength = groups.length
groups.map((gp) => {
  gp.pageUrls = [] // 要抓取的页面数组
  // allLength = allLength + 1
  for (let i = 0; i < page; i++) {
    // allLength = allLength + i
    gp.pageUrls.push({
      url: gp.url + i * start // 构造成类似 https://www.douban.com/group/liwanzufang/discussion?start=0
    });
  }
})
const iprequstFuc = url => new Promise((resolve, reject) => request.get(url, (err, response, body) => {
  if (err) {
  reject(err);
  } else {
  resolve(JSON.parse(body));
  }
}))

// 接口中部分函数定义
const getPageInfo = (ip, pageItem, callback) => {
  //  设置访问间隔
  let delay = parseInt((Math.random() * 30000000) % 1000, 10)
  let resultBack = {label: pageItem.key, list: []}
  console.log('pageItem.pageUrls', pageItem.pageUrls)
  pageItem.pageUrls.forEach(pageUrl => {
    superagent.get(pageUrl.url).proxy(ip)
      // 模拟浏览器
      .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36')
      //  如果你不乖乖少量爬数据的话，很可能被豆瓣kill掉，这时候需要模拟登录状态才能访问
      .set('Cookie', '')
      .end((err, pres) => {
        // console.log('能进来吗？', pres)
        console.log('进到这里来了')
        if (err || !pres) {
          console.log('爬取失败了')
          ep.emit('preparePage', [])
          return
        }
        let $ = cheerio.load(pres.text) // 将页面数据用cheerio处理，生成一个类jQuery对象
        let itemList = $('.olt tbody').children().slice(1, 26) // 取出table中的每行数据，并过滤掉表格标题
        // 遍历页面中的每条数据
        for (let i = 0; i < itemList.length; i++) {
          let item = itemList.eq(i).children()

          let title = item.eq(0).children('a').text() || '' // 获取标题
          let url = item.eq(0).children('a').attr('href') || '' // 获取详情页链接
          // let author = item.eq(1).children('a').attr('href').replace('https://www.douban.com/people', '').replace(/\//g, '') || ''  // 获取作者id
          let author = item.eq(1).children('a').text() || '' // 这里改为使用作者昵称而不是id的原因是发现有些中介注册了好多账号，打一枪换个地方。虽然同名也有，但是这么小的数据量下，概率低到忽略不计
          let markSum = item.eq(2).text() // 获取回应数量
          let lastModify = item.eq(3).text() // 获取最后修改时间

          let data = {
            title,
            url,
            author,
            markSum,
            lastModify,
            label: pageItem.key
          }
          resultBack.list.push(data)
        }
        // ep.emit('事件名称', 数据内容)
        console.log('触发preparePage')
        ep.emit('preparePage', resultBack) // 每处理完一条数据，便把这条数据通过preparePage事件发送出去，这里主要是起计数的作用
        setTimeout(() => {
          callback(null, pageItem.url);
        }, delay);
      })
  })
}

function getData(ip, keys, res) {
  //  遍历爬取页面
  let tempGroup = groups.filter((item) =>  keys.includes(item.key))
  console.log('tempGroup.length * page', tempGroup.length * page)
  ep.after('preparePage', tempGroup.length * page, function (data, res) {
    // 这里我们传入不想要出现的关键词，用'|'隔开 。比如排除一些位置，排除中介常用短语
    let filterWords = /求组|合租|求租|主卧|求整租|室友|交友|次卧|跪求|寻租|组长|房东群|舍友|教你|招室友|限女|限男/
    // 再次遍历抓取到的数据
    let inserTodbList = []
    console.log('here')
    data.forEach(item => {
      //  这里if的顺序可是有讲究的，合理的排序可以提升程序的效率
      console.log('便利村粗', item.list)
      if (!item.list) return false
      item.list = item.list.filter((ops) => {
        if (ops.markSum > 100) {
          console.log('评论过多，丢弃')
          return false
        }
        console.log('ops.title', ops.title)
        if (filterWords.test(ops.title)) {
          console.log('标题带有不希望出现的词语')
          return false
        }
        return true
      })
      inserTodbList.push(...item.list)
    })
    console.log('什么进展？')
    let uniqueTitle = []
    let uniqueList = []
    inserTodbList.map((item) => {
      console.log('item', item)
      if (!uniqueTitle.includes(item.title)) {
        uniqueList.push(item)
        uniqueTitle.push(item.title)
      }
    })
    global.db.__insertMany('douban', inserTodbList, function () {
      ep.emit('spiderEnd', {})
    })
  });
  async.mapLimit(tempGroup, 1, function (item, callback) {
    getPageInfo(ip, item, callback);
  }, function (err) {
    if (err) {
      console.log(err)
    }
    console.log('抓取完毕')
  });
}
// 接口
// 接口
// 接口

// 获取ip
app.post('/api/getIps/', async (req, res) => {
  // async function getIps(callback) {
  //   // let ips = ipProxy.ips
  //   callback(ips)
  //   // ips((err,response) => {
  //   //   callback(response)
  //   // })
  // }
  // getIps(function (ipList) {
  //   console.log('ipList', ipList)
  //   res.send({
  //     msg: '获取成功',
  //     list: ipList
  //   })
  // })
  let {url} = req.body.params
  if (!url) {
    res.send({
      msg: '获取ip失败，未有输入API',
      list: []
    })
    return
  }
  console.log('到这一步了', url)
  let ipdata = await iprequstFuc(url)
  res.send({
    msg: '获取成功',
    list: ipdata.data
  })
})

// 更新ip池
app.get('/api/updateIps', (req, res) => {
  ipProxy.run(() => {
    console.log('更新完毕')
  })
})
// 向豆瓣爬取
app.get('/api/getDataFromDouBan', (req, res) => {
  let {ip, keys} = req.query
  getData(ip,keys, res)
  ep.after('spiderEnd', 1, function() {
    res.send({
      data: '爬取结束'
    })
  })
})
// 向数据库中查询数据
app.get('/api/doubanList', (req, res) => {
  let {label, page = 1, pageSize = 10} = req.query
  let param = []
  label && label.map((item) => {
    param.push({label: item})
  })
  let queryJson = {
    // $where: "label"
  }
  // queryJson['$sort'] = [{ KEY: 1 }]
  if (param.length) queryJson['$or'] = param
  global.db.__find('douban', {queryJson, page, pageSize, sort: {'_id': -1}}, function (data) {
    res.send({
      msg: '获取成功',
      ...data
    })
  })
})
// 根据根据关键字搜索内容
app.get('/api/searchRecord', (req, res) => {
  let {words, page = 1, pageSize = 10} = req.query
  let queryJson = {
    'title': new RegExp(words,"g")
  }
  global.db.__find('douban', {queryJson, page, pageSize, sort: {'_id': -1}}, function (data) {
    res.send({
      msg: '获取成功',
      ...data
    })
  })
})
// 根据id删除数据
app.get('/api/deleteRecord', (req, res) => {
  let {ids} = req.query
  const list = ids.map((id) => {
    return new ObjectId(id)
  })
  global.db.__DeleteMany('douban', {_id: {$in: list}}, function (data) {
    res.send({
      msg: '删除成功',
      ...data
    })
  })
})
