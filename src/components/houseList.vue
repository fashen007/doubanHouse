<template>
  <div style="padding: 10px 20px;">
    <Row style='margin-top: 20px'>
       <Col span="2"> 获取代理IP：</Col>
      <Col span="6">
       <Input v-model="ipApiUrl" placeholder="请输入获取代理的API..." style='width: 100%' />
      </Col>
      <Col span="8" style="text-align:left;margin-left:10px">
        <!-- <Button type="primary" @click="updateIpsHandler" :loading="loading">更新Ip池</Button> &nbsp; -->
        <Button type="primary" @click="getIpsHandler" :disabled="!ipApiUrl">获取代理ip</Button>
        <Tooltip max-width="200" content=''>
          <div slot="content">从<a href='http://zhimahttp.com/getapi/' target="_blank">芝麻代理</a>获取IP生成链接，进行解析，注意需要json格式</div>
          <Icon type="ios-help-circle" style="font-size: 20px; color: #888; margin-left:5px"/>
        </Tooltip>
      </Col>
      
    </Row>
    <Row style='margin-top: 20px'>
      <Col span="2"> 豆瓣小组：</Col>
      <Col span="21" style="text-align:left">
        <Checkbox-group v-model="araGroup" style="margin-bottom: 20px">
          <Checkbox :label="item.key" v-for="item in urls" :key="item.key">
            <Icon :type="item.icon" />
            <a :href="item.url" target="_blank">{{item.label}}</a>
          </Checkbox>
        </Checkbox-group>
      </Col>
    </Row>
    <Row style='margin-top: 20px'>
      <Col span="2"> 
      <Tooltip max-width="200" content='搜索出来的结果，不能包含这些关键字'>
        过滤：<Icon type="ios-help-circle" style="font-size: 10px; color: #888;"/>
      </Tooltip></Col>
      <Col span="21" style="text-align:left">
        <Checkbox-group v-model="defaultWords" style="margin-bottom: 20px">
          <Checkbox :label="item" v-for="item in filterWordsArr" :key="item">
            <span >{{item}}</span>
          </Checkbox>
        </Checkbox-group>
      </Col>
    </Row>
    <Row style='margin-top: 20px'>
      <Col span="2"> 
      <Tooltip max-width="200" content='搜索出来的结果需要包含这些关键字'>
        含有：<Icon type="ios-help-circle" style="font-size: 10px; color: #888;"/>
      </Tooltip>
      </Col>
      <Col span="6" style="text-align:left">
         <Input placeholder="输入包含的关键字" v-model="spiderWords"/>
      </Col>
      <Col span="4">
        <Select v-model="ip" style="width:200px" placeholder="选择爬虫IP">
            <Option v-for="item in ipList" :value="`http://${item.ip}:${item.port}`" :key="`${item.ip}:${item.port}`" :disabled='item.disabled'>http://{{item.ip}}:{{item.port}}</Option>
        </Select>
        <!-- <Select v-model="ip" style="width:100px" placeholder="选择爬取的页数">
            <Option v-for="item in [1, 2, 3, 4, 5]" :value="item" :key="`${item}`">{{item}}</Option>
        </Select> -->
      </Col>
      <Col span="6">
        <Select v-model="spiderPageNum" style="width:200px" placeholder="选择爬取的页数">
            <Option v-for="item in [1, 2, 3, 4, 5]" :value="item" :key="`${item}`">{{item}}</Option>
        </Select>
         &nbsp;
        <Tooltip max-width="200" content='IP爬取过一次可能会被封，需要重新获取IP'>
          <Button type="primary" @click="spiderDataHandler" :loading="loading" :disabled='!this.ip||!this.spiderPageNum'>开始爬取数据</Button>
        </Tooltip>
      </Col>
    </Row>
    <Row style='margin-top: 20px; margin-bottom: 10px' type="flex" justify="center">
      <Col span="16">&nbsp;</Col>
      <Col span="6">
        <Input search @on-search='searchKeyWords' enter-button placeholder="Enter something..." v-model="words"/>
      </Col>
      <Col span="2">
        <Button :disabled='!selectItems.length' type="error" @click="removeAll">批量删除</Button>
      </Col>
    </Row>
    <Table  :context="self" :columns="columns" :data="houseData" @on-selection-change='selectChange' :loading="loading">
      <template slot-scope="{ row, index }" slot="action">
          <Button type="error" size="small" @click="remove(index, row)">删除</Button>
      </template>
    </Table>
    <Page style='float: right; margin-top: 20px' :current="page" :total="total" :page-size='pageSize' @on-change='pageChage' @on-page-size-change='changePagesize' show-sizer :page-size-opts='[10,20,40,80,100]'></Page>
  </div>
</template>

<script>
import { getHousData, spiderData, updateIps, getIps, deleteRecord, searchRecord} from "@/api/fetch";
import urls from 'server/urls'
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  created () {
    this.getList()
    this.ipApiUrl = sessionStorage.getItem('IPURL')
    this.pageSize = +sessionStorage.getItem('pageSize')
    this.spiderPageNum = +sessionStorage.getItem('spiderPageNum')
    let ipList = sessionStorage.getItem('IPLIST')
    this.ipList = JSON.parse(ipList)
    let araGroup = sessionStorage.getItem('araGroup')
    this.araGroup = JSON.parse(araGroup) || []
   
  },
  data() {
    return {
      nam: "",
      araGroup: ['gzzf', 'gzyxzf', 'gzbyzf', 'gzthzf', 'gzlwzf', 
      'gzpyzf', 'gzhzzf', 'gzzfgr', 'gzzfjy', 'gzzswl', 'gzgy', 'gzhz', 'gzzfz', 'gzzzq','gzbyqzf','gzmfzfdjh','gzzf2','fdzzdjzj','gzzf4', 'ilovegz'] ,
      loading: false,
      self: this,
      page: 1,
      pageSize: 20,
      ip: '',
      words: '',
      ipApiUrl: '',
      ipList: [],
      total: 0,
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: "标题",
          key: "title",
          minWidth: 300
        },
        {
          title: "链接",
          key: "url",
          minWidth: 200,
          render: (h, params) => {
            return h('a', {
              attrs: {
                href: params.row.url,
                target: '_blank'
              },
            },[
                h('Icon', {
                    props: {
                      type: 'person'
                    }
                }),
                h('strong', params.row.url)
            ]);
          }
        },
        {
          title: "评论",
          key: "markSum"
        },
        {
          title: "作者",
          key: "author"
        },
        {
          title: "最后修改时间",
          key: "lastModify"
        },
        {
          title: "操作",
          key: "action",
          slot: 'action'
        }
      ],
      houseData: [],
      urls: urls,
      defaultWords: ["求组","合租", "求租", "主卧", "求整租","室友", "交友", "次卧", "跪求", "寻租", "组长", "房东群", "舍友", "教你", "招室友", "限女", "限男", "求房"],
      filterWordsArr: [
        "求组","合租", "求租", "主卧", "求整租","室友", "交友", "次卧", "跪求", "寻租", "组长", "房东群", "舍友", "教你", "招室友", "限女", "限男"
      ,"求房"],
      spiderWords: '',
      spiderPageNum: 1, //爬取页码
      selectItems: []
    };
  },
  methods: {
    async remove(index, row) {
      await deleteRecord({ids: [row._id]})
      this.houseData = this.houseData.filter((item) => item._id !== row._id)
    },
    async removeAll() {
      let ids = this.selectItems.map((row) => row._id)
      await deleteRecord({ids})
      this.houseData = this.houseData.filter((item) => !ids.includes(item._id))
    },
    changePagesize (size) {
      this.pageSize = size
      sessionStorage.setItem('pageSize', this.pageSize)
      this.getList()
    },
    selectChange (arg) {
      this.selectItems = arg
    },
    async searchKeyWords () {
      let { list, total} = await searchRecord({words: this.words, page: this.page, pageSize: this.pageSize})
      this.total = total || 0
      this.houseData = list;
    },
    async spiderDataHandler() {
      if (!this.araGroup.length) {
        this.$Message.warning('请选择豆瓣小组')
        return
      }
      this.loading = true;
      let data = await spiderData({ip: this.ip, keys: this.araGroup, filterWords: this.defaultWords, spiderWords: this.spiderWords, spiderPageNum: this.spiderPageNum});
      this.loading = false;
      if (data.code === -1) {
        this.ipList.forEach(ob => {
          if (this.ip.includes(ob.ip)) {
            ob.disabled = true
            return
          }
        });
        sessionStorage.setItem('IPLIST', JSON.stringify(this.ipList))
        this.$Message.error(data.msg)
        return
      }
      this.$Message.success(data.msg)
      this.getList()
    },
    updateIpsHandler () {
      updateIps()
    },

    async getIpsHandler () {
      if (!this.ipApiUrl) {
        this.$Message.warning('请输入IP API') 
        return
      }
      let {list} = await getIps({url: this.ipApiUrl})
      this.ipList = []
      list.map((ls) => {
        if (!this.ipList.some((o) => o.ip === ls.ip && o.port === ls.port)) this.ipList.push(ls)
      })
      sessionStorage.setItem('IPLIST', JSON.stringify(this.ipList))
      this.$Message.success('获取成功') 
    },
    async getList () {
      let { list, total} = await getHousData({ label: this.araGroup, page: this.page, pageSize: this.pageSize});
      this.total = total || 0
      this.houseData = list;
    },
    pageChage (val) {
      this.page = val
      if (this.words) return this.searchKeyWords()
      this.getList()
    }
  },
  watch: {
    araGroup(val, old) {
      if(val !== old) sessionStorage.setItem('araGroup', JSON.stringify(val))
      this.getList()
    },
    ipApiUrl(val, old) {
      if (val === old) return
      sessionStorage.setItem('IPURL', val)
    },
    spiderPageNum (val, old) {
      if (val === old) return
      sessionStorage.setItem('spiderPageNum', val)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
