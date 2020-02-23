// db.js
/**
 *  数据库封装
 * 
 */

var MongodbClient = require('mongodb').MongoClient
var assert = require('assert')
var url = "mongodb://localhost:27017";
/**
 * 连接数据库
 */

function __connectDB(callback) {
  MongodbClient.connect(url, function (err, client) {
    let db = client.db('zufangzi')
    callback(err, db, client)
  })
  // }, { useNewUrlParser: true })
}


/**
 * 插入一条数据
 * @param {*} collectionName 集合名
 * @param {*} Datajson 写入的json数据
 * @param {*} callback 回调函数
 */
function __insertOne(collectionName, Datajson, callback) {
  __connectDB(function (err, db, client) {
    var collection = db.collection(collectionName);
    collection.insertOne(Datajson, function (err, result) {
      callback(err, result); // 通过回调函数上传数据
      client.close();
    })
  })
}
/**
 * 插入多条数据
 * @param {*} collectionName 集合名
 * @param {*} Datajson 写入的json数据
 * @param {*} callback 回调函数
 */
function __insertMany(collectionName, Datajson, callback) {
  __connectDB(function (err, db, client) {
    var collection = db.collection(collectionName);
    collection.insertMany(Datajson, function (err, result) {
      callback(err, result); // 通过回调函数上传数据
      console.log('插入数据', Datajson)
      client.close();
    })
  })
}

/**
 * 查找数据
 * @param {*} collectionName 集合名
 * @param {*} Datajson 查询条件
 * @param {*} callback 回调函数
 */

function __find(collectionName, {queryJson, page, pageSize}, callback) {
  var result = [];
  if (arguments.length != 3) {
    callback("find函数必须传入三个参数哦", null)
    return
  }
  __connectDB(async function (err, db, client) {
    var cursor = db.collection(collectionName).find(queryJson).skip((page - 1) * pageSize).limit(10);
    let total = await cursor.count()
    if (!err) {
      await cursor.forEach(function (doc) {
        // 如果出错了，那么下面的也将不会执行了
        // console.log('doc', doc)
        if (doc != null) {
          result.push(doc)
        }
      })
      callback({list: result, total})
    }
    client.close();
  })
}

/**
 * 
 * 删除数据（删除满足条件的所有数据哦）
 * @param {*} collectionName 集合名
 * @param {*} json 查询的json数据
 * @param {*} callback 回调函数
 */

function __DeleteMany(collectionName, json, callback) {
  __connectDB(function (err, db, client) {
    assert.equal(err, null)
    //删除
    db.collection(collectionName).deleteMany(
      json,
      function (err, results) {
        assert.equal(err, null)
        callback(err, results);
        client.close(); //关闭数据库
      }
    );
  });
}


/**
 * 修改数据
 * @param {*} collectionName 集合名
 * @param {*} json1 查询的对象
 * @param {*} json2 修改
 * @param {*} callback 回调函数
 */

function __updateMany(collectionName, json1, json2, callback) {
  __connectDB(function (err, db, client) {
    assert.equal(err, null)
    db.collection(collectionName).updateMany(
      json1,
      json2,
      function (err, results) {
        assert.equal(err, null)
        callback(err, results)
        client.close()
      }
    )
  })
}


/**
 * 获取总数
 * @param {*} collectionName 集合名
 * @param {*} json 查询条件
 * @param {*} callback 回调函数
 */

function __getCount(collectionName, json, callback) {
  __connectDB(function (err, db, client) {
    db.collection(collectionName).count(json).then(function (count) {
      callback(count)
      client.close();
    })
  })
}


/**
 * 分页查找数据
 * @param {*} collectionName 集合名
 * @param {*} JsonObj 查询条件
 * @param {*} C 【可选】传入的参数，每页的个数、显示第几页
 * @param {*} C  callback
 */

function __findByPage(collectionName, JsonObj, C, D) {
  var result = []; //结果数组
  if (arguments.length == 3) {
      //那么参数C就是callback，参数D没有传。
      var callback = C;
      var skipnumber = 0;
      //数目限制
      var limit = 0;
  } else if (arguments.length == 4) {
      var callback = D;
      var args = C;
      //应该省略的条数
      var skipnumber = args.pageamount * args.page || 0;
      //数目限制
      var limit = args.pageamount || 0;
      //排序方式
      var sort = args.sort || {};
  } else {
      throw new Error("find函数的参数个数，必须是3个，或者4个。");
      return;
  }

  //连接数据库，连接之后查找所有
  __connectDB(function (err, db, client) {
      var cursor = db.collection(collectionName).find(JsonObj).skip(skipnumber).limit(limit).sort(sort);
      cursor.each(function (err, doc) {
          if (err) {
              callback(err, null);
              client.close(); //关闭数据库
              return;
          }
          if (doc != null) {
              result.push(doc); //放入结果数组
          } else {
              //遍历结束，没有更多的文档了
              callback(null, result);
              client.close(); //关闭数据库
          }
      });
  });
}


module.exports = {
  __connectDB,
  __insertOne,
  __insertMany,
  __find,
  __DeleteMany,
  __updateMany,
  __getCount,
  __findByPage
}
// db.js 文件是数据库操作的DAO 层的封装