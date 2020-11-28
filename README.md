# zufangzi

> 豆瓣租房子小组爬虫

### 本地启动
    
    > yarn 

    > 启动 mongod (需要提前安装好mongodb)

    > yarn dev 启动本地前端服务

    > nodemon server.js 启动node服务
    
### 注意事项
    
    > 需要配置好本地的 前端服务和mongodb 之间的本地ip和代理

    > 需要提前知道代理ip的API，比如我一般测试用的是芝麻代理(http://zhimahttp.com/getapi/)

    > 不要短时间内大量爬取豆瓣 会被封ip
