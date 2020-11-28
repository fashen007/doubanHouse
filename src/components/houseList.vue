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
        <Tooltip max-width="200" content='从http://zhimahttp.com/getapi/（芝麻代理）获取IP链接，进行解析，注意需要json格式'>
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
      <Col span="2"> 过滤：</Col>
      <Col span="21" style="text-align:left">
        <Checkbox-group v-model="defaultWords" style="margin-bottom: 20px">
          <Checkbox :label="item" v-for="item in filterWordsArr" :key="item">
            <span >{{item}}</span>
          </Checkbox>
        </Checkbox-group>
      </Col>
    </Row>
    <Row style='margin-top: 20px'>
      <Col span="2"> 含有：</Col>
      <Col span="6" style="text-align:left">
         <Input placeholder="输入包含的关键字" v-model="spiderWords"/>
      </Col>
      <Col span="6">
        <Select v-model="ip" style="width:200px" placeholder="选择爬虫IP">
            <Option v-for="item in ipList" :value="`http://${item.ip}:${item.port}`" :key="`${item.ip}:${item.port}`">http://{{item.ip}}:{{item.port}}</Option>
        </Select>
         &nbsp;
        <Tooltip max-width="200" content='IP爬取过一次可能会被封，需要重新获取IP'>
          <Button type="primary" @click="spiderDataHandler" :loading="loading" :disabled='!this.ip'>开始爬取数据</Button>
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
      defaultWords: ["求组","合租", "求租", "主卧", "求整租","室友", "交友", "次卧", "跪求", "寻租", "组长", "房东群", "舍友", "教你", "招室友", "限女", "限男"],
      filterWordsArr: [
        "求组","合租", "求租", "主卧", "求整租","室友", "交友", "次卧", "跪求", "寻租", "组长", "房东群", "舍友", "教你", "招室友", "限女", "限男"
      ],
      spiderWords: '',
      selectItems: []
    };
  },
  methods: {
    async remove(index, row) {
      let data = await deleteRecord({ids: [row._id]})
      this.houseData = this.houseData.filter((item) => item._id !== row._id)
    },
    async removeAll(index, row) {
      let ids = this.selectItems.map((row) => row._id)
      let data = await deleteRecord({ids})
      this.houseData = this.houseData.filter((item) => !ids.includes(item._id))
    },
    changePagesize (size) {
      this.pageSize = size
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

    ratioChange(val) {
      // getHousData({area: val})
    },
    async spiderDataHandler() {
      this.loading = true;
      let data = await spiderData({ip: this.ip, keys: this.araGroup, filterWords: this.filterWords, spiderWords: this.spiderWords});
      console.log('data', data)
      this.loading = false;
      if (data.code === -1) {
        this.$Message.error(data.msg)
        return
      }
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
        // if (!ls.ip) ls.ip = ls.ip
        if (!this.ipList.some((o) => o.ip === ls.ip && o.port === ls.port)) this.ipList.push(ls)
      })
      sessionStorage.setItem('IPLIST', JSON.stringify(this.ipList))
      this.$Message.success('获取成功') 
    },
    async getList () {
      let { list, total} = await getHousData({ label: this.araGroup, page: this.page, pageSize: this.pageSize});
      this.total = total || 0
      this.houseData = list;
      // list.map(item => {
      //   this.houseData.push(...item.list);
      // });
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
