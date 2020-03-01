<template>
  <div style="padding: 10px 20px;">
    <Row style='margin-top: 20px'>
      <Col span="8">
        <!-- <Button type="primary" @click="updateIpsHandler" :loading="loading">更新Ip池</Button> &nbsp; -->
       <Input v-model="ipApiUrl" placeholder="请输入获取代理的API..." style='width: 100%' />
      </Col>
      <Col span="6" style="text-align:left">
        <!-- <Button type="primary" @click="updateIpsHandler" :loading="loading">更新Ip池</Button> &nbsp; -->
        <Button type="primary" @click="getIpsHandler" :loading="loading" >获取代理ip</Button>
      </Col>
      <Col span="8">
        <Select v-model="ip" style="width:200px">
            <Option v-for="item in ipList" :value="`http://${item.ip}:${item.port}`" :key="`${item.ip}:${item.port}`">http://{{item.ip}}:{{item.port}}</Option>
        </Select>
         &nbsp;
        <Button type="primary" @click="spiderDataHandler" :loading="loading" :disabled='!this.ip'>爬取数据</Button>
      </Col>
    </Row>
    <Row style='margin-top: 20px'>
      <Col span="2"> 地区：</Col>
      <Col span="20">
        <Checkbox-group v-model="araGroup" style="margin-bottom: 20px">
          <Checkbox :label="item.key" v-for="item in urls" :key="item.key">
            <Icon :type="item.icon" />
            <span>{{item.label}}</span>
          </Checkbox>
        </Checkbox-group>
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
    <Page style='float: right; margin-top: 20px' :current="page" :total="total" :page-size='pageSize' @on-change='pageChage' @on-page-size-change='changePagesize' show-sizer></Page>
  </div>
</template>

<script>
import { getHousData, spiderData, updateIps, getIps, deleteRecord, searchRecord} from "@/api/fetch";
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
      'gzpyzf', 'gzhzzf', 'gzzfgr', 'gzzfjy', 'gzzswl', 'gzgy', 'gzhz', 'gzzfz', 'ilovegz'] ,
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
      urls: [
        {
          url: "https://www.douban.com/group/gz020/",
          label: "广州租房★",
          key: "gzzf",
          icon: 'ios-cafe'
        },
        {
          url: "https://www.douban.com/group/yuexiuzufang/",
          label: "广州越秀租房",
          key: "gzyxzf"
        },
        {
          url: "https://www.douban.com/group/baiyunzufang/",
          label: "广州白云租房",
          key: "gzbyzf"
        },
        {
          url: "https://www.douban.com/group/tianhezufang/",
          label: "广州天河租房",
          key: "gzthzf"
        },
        {
          url: "https://www.douban.com/group/liwanzufang/",
          label: "广州荔湾租房",
          key: "gzlwzf"
        },
        {
          url: "https://www.douban.com/group/haizhuzufang/",
          label: "广州海珠租房",
          key: "gzhzzf"
        },
        {
          url: "https://www.douban.com/group/panyuzufang/",
          label: "广州番禺租房",
          key: "gzpyzf"
        },
        {
          url: "https://www.douban.com/group/gz_rent/",
          label: "广州租房",
          key: "gzzfgr"
        },
        {
          url: "https://www.douban.com/group/zu.gz.soufun/",
          label: "广州租房交友",
          key: "gzzfjy"
        },
        {
          url: "https://www.douban.com/group/366393/",
          label: "广州真房实客网租房组",
          key: "gzzswl"
        },
        {
          url: "https://www.douban.com/group/366393/",
          label: "广州公寓租房信息",
          key: "gzgy"
        },
        {
          url: "https://www.douban.com/group/216688/",
          label: "广州合租联盟---大学",
          key: "gzhz"
        },
        {
          url: "https://www.douban.com/group/zunar_gz/",
          label: "广州租房族",
          key: "gzzfz"
        },
        {
          url: "https://www.douban.com/group/IloveGZ/",
          label: "广州租房（好评度★★★★★）",
          key: "ilovegz"
        }
      ],
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
      let data = await spiderData({ip: this.ip, keys: this.araGroup});
      this.loading = false;
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
