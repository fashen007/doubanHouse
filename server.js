// 服务启动

const express = require('express');
// const bodyParser = require('body-parser')
const app = express();
let server = app.listen(2333, "127.0.0.1", function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('Your App is running at' + host + ':' + port, );
})
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// // 访问静态资源
// app.use(express.static(path.resolve(__dirname, '../dist')));
const groups = require('./server/urls')
let page = 1 // 抓取页面数量
let perPageQuantity = 24  //  每页数据条数
// const fs = require('fs')    // node的文件模块，用于将筛选后的数据输出为html
// const path = require('path') // node的路径模块，用于处理文件的路径
// // 客户端请求代理模块
const superagent = require('superagent');
// // 通过事件来决定执行顺序的工具，下面用到时作详解
const eventproxy = require('eventproxy');
const ipProxy = require('ip-proxy-pool');
const fetch = require("node-fetch")
let ep = new eventproxy()  //  实例化eventproxy
// // node端操作dom的利器，可以理解成node版jQuery，语法与jQuery几乎一样
const cheerio = require('cheerio');
//  async是一个第三方node模块，mapLimit用于控制访问频率
const async = require('async');
require('superagent-proxy')(superagent);

global.db = require('./server/db')
// let baseUrl = 'https://www.douban.com/group/tianhezufang/discussion?start=';

// //  我们设置三个全局变量来保存一些数据
// let result = []   //  存放最终筛选结果
// let authorMap = {} // 我们以对象属性的方式，来统计每个的发帖数
// let intermediary = [] // 中介id列表，你也可以把这部分数据保存起来，以后抓取的时候直接过滤掉！

// if (process.argv[2] && process.argv[2] == 'update') {
//   // proxy.run()
//   return
// }
let allLength = 0
groups.map((gp) => {
  gp.pageUrls = [] // 要抓取的页面数组
  allLength = allLength + 1
  for (let i = 0; i < page; i++) {
    allLength = allLength + i
    gp.pageUrls.push({
      url: gp.url + i * perPageQuantity
    });
  }
})

// // var ips = proxy.ips
// // ips((err, response) => {
// //   start(response)
// // })
async function getIps(callback) {
  let ips = ipProxy.ips
  ips((err,response) => {
    response.length ? callback(response) : ipProxy.run() 
  })
  // return await this.pool.getProxy();
  // return new Promise((resolve, reject) => {
  //   fetch("http://spys.me/proxy.txt")
  //   .then(res => res.text())
  //   .then(ipport => {
  //     const regex = /[0-9]+(?:\.[0-9]+){3}:[0-9]+/gm;
  //     const allIP = [];
  //     while ((m = regex.exec(ipport)) !== null) {
  //       if (m.index === regex.lastIndex) {
  //         regex.lastIndex++;
  //       }
  //       m.map(ip => {
  //         allIP.push(ip);
  //       });
  //     }
  //     resolve(allIP)
  //   })
  // })
}
function getData(proxyIp, res) {
  //  遍历爬取页面
  async.mapLimit(groups, 1, function (item, callback) {
    getPageInfo(proxyIp, item, callback);
  }, function (err) {
    if (err) {
      console.log(err)
    }
    console.log('抓取完毕')
  });
}
ep.after('preparePage', allLength, function (data, res) {
  // 这里我们传入不想要出现的关键词，用'|'隔开 。比如排除一些位置，排除中介常用短语
  let filterWords = /求组|合租|求租/
  // 这里我们传入需要筛选的关键词，如没有，可设置为空格
  // let keyWords = /西二旗/

  // 我们先统计每个人的发帖数，并以对象的属性保存。这里利用对象属性名不能重复的特性实现计数。
  // data.forEach(item => {
  //   authorMap[item.author] = authorMap[item.author] ? ++authorMap[item.author] : 1
  //   if (authorMap[item.author] > 4) {
  //     intermediary.push(item.author) // 如果发现某个人的发帖数超过5条，直接打入冷宫。
  //   }
  // })
  // 数组去重，Set去重了解一下，可以查阅Set这种数据结构
  // intermediary = [...new Set(intermediary)]
  // 再次遍历抓取到的数据
  data.forEach(item => {
    //  这里if的顺序可是有讲究的，合理的排序可以提升程序的效率
    item.list = item.list.filter(() => {
      if (item.markSum > 100) {
        console.log('评论过多，丢弃')
        return false
      }
      if (filterWords.test(item.title)) {
        console.log('标题带有不希望出现的词语')
        console.log('item', item)
        return false
      }
      return true
    })
    console.log('item.list', item.list)
    // if (intermediary.includes(item.author)) {
    //   console.log('发帖数过多，丢弃')
    //   return
    // }
    // result.push(item)
    // //  只有通过了上面的层层检测，才会来到最后一步，这里如果你没有设期望的关键词，筛选结果会被统统加到结果列表中
    // if (keyWords.test(item.title)) {
    //   result.push(item)
    // }
  })
  console.log('data', data)
  global.db.__insertMany('douban', data, function () {
    ep.emit('spiderEnd', {})
  })
});
const getPageInfo = (proxyIp, pageItem, callback) => {
  //  设置访问间隔
  // let proxDomain = 'http://' + proxyIp[0]
  let proxDomain = 'http://' + proxyIp[2].ip + ':' + proxyIp[2].port
  console.log('proxDomain', proxDomain)
  let delay = parseInt((Math.random() * 30000000) % 1000, 10)
  let resultBack = {label: pageItem.key, list: []}
  pageItem.pageUrls.forEach(pageUrl => {
    superagent.get(pageUrl.url).proxy(proxDomain)
      // 模拟浏览器
      .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36')
      //  如果你不乖乖少量爬数据的话，很可能被豆瓣kill掉，这时候需要模拟登录状态才能访问
      .set('Cookie', '')
      .end((err, pres) => {
        if (err || !pres) {
          proxyIp.shift()
          getPageInfo(proxyIp, pageItem, callback)
        }
        console.log('pres.text', pres.text)
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
          }
          resultBack.list.push(data)
        }
        // ep.emit('事件名称', 数据内容)
        console.log('resultBack', resultBack)
        ep.emit('preparePage', resultBack) // 每处理完一条数据，便把这条数据通过preparePage事件发送出去，这里主要是起计数的作用
        setTimeout(() => {
          callback(null, pageItem.url);
        }, delay);
      })
  })
}
// app.get('/',  async (req, res) => {
//   var params = req.query
//   console.log('params', params)
//   let ips = await getIps()
//   getData(ips)
//   res.send()
// })

app.get('/api/getDataFromDouBan', (req, res) => {
  getIps(function (ipList) {
    getData(ipList, res)
  })
  ep.after('spiderEnd', 1, function() {
    res.send({
      data: '爬取结束'
    })
  })
})
app.get('/api/doubanList', (req, res) => {
  let query = req.query
  let param = []
  query.label.map((item) => {
    param.push({label: item})
  })
  console.log('param', param)
  global.db.__find('douban', param, function (data) {
    console.log('data', data)
    res.send({
      msg: '获取成功',
      data: data
    })
  })
})