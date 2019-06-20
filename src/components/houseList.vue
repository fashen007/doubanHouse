<template>
  <div>
    <Button type="primary" @click="spiderData" :loading="loading">爬取数据</Button>
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
    <Table :context="self" :columns="columns" :data="houseData"> </Table>
  </div>
</template>

<script>
import { getHousData, spiderData } from "@/api/fetch";
export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  data() {
    return {
      nam: "",
      araGroup: [],
      loading: false,
      self: this,
      columns: [
        {
          title: "标题",
          key: "title",
          minWidth: 200
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
    async spiderData() {
      this.loading = true;
      let data = await spiderData();
      this.loading = false;
    }
  },
  watch: {
    async araGroup(val) {
      let { list } = await getHousData({ label: val });
      this.houseData = [];
      list.map(item => {
        this.houseData.push(...item.list);
      });
      console.log("this.houseData", this.houseData);
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
