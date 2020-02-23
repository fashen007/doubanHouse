<template>
  <div style="padding: 10px 20px;">
    <Row style='margin-top: 20px'>
      <Col span="6">
        <Button type="primary" @click="updateIpsHandler" :loading="loading">更新Ip池</Button> &nbsp;
        <Button type="primary" @click="getIpsHandler" :loading="loading">获取代理ip</Button>
      </Col>
      <Col span="6">
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
    <Table  :context="self" :columns="columns" :data="houseData"> </Table>
    <Page style='float: right; margin-top: 20px' :current="page" :total="total" @on-change='pageChage'></Page>
  </div>
</template>

<script>
import { getHousData, spiderData, updateIps, getIps } from "@/api/fetch";
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  created () {
    this.getIpsHandler()
    this.getList()
  },
  data() {
    return {
      nam: "",
      araGroup: ['gzzf'],
      loading: false,
      self: this,
      page: 1,
      ip: '',
      ipList: [],
      total: 0,
      columns: [
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
        }
      ]
    };
  },
  methods: {
    ratioChange(val) {
      // console.log('val', val)
      // getHousData({area: val})
    },
    async spiderDataHandler() {
      this.loading = true;
      let data = await spiderData({ip: this.ip});
      this.loading = false;
    },
    updateIpsHandler () {
      updateIps()
    },
    async getIpsHandler () {
      let {list} = await getIps()
      this.ipList = []
      list.map((ls) => {
        if (!this.ipList.some((o) => o.ip === ls.ip && o.port === ls.port))this.ipList.push(ls)
      })
    },
    async getList () {
      let { list, total} = await getHousData({ label: this.araGroup, page: this.page});
      this.total = total || 0
      this.houseData = list;
      // list.map(item => {
      //   this.houseData.push(...item.list);
      // });
    },
    pageChage (val) {
      console.log('val', val)
      this.page = val
      this.getList()
    }
  },
  watch: {
    araGroup(val) {
      this.getList()
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
