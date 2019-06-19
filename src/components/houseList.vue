<template>
  <div>
    <Button type="primary" @click='spiderData' :loading="loading">爬取数据</Button>
    <Checkbox-group v-model="araGroup" style='margin-bottom: 20px'>
        <Checkbox :label="item.key" v-for='item in urls' :key="item.key">
            <Icon type="wineglass"></Icon>
            <span>{{item.label}}</span>
        </Checkbox>
        <!-- <Radio label="haizhu">
            <Icon type="coffee"></Icon>
            <span>海珠区</span>
        </Radio>
        <Radio label="yuexiu">
            <Icon type="icecream"></Icon>
            <span>越秀区</span>
        </Radio>
        <Radio label="liwan">
            <Icon type="soup-can"></Icon>
            <span>荔湾区</span>
        </Radio>
        <Radio label="panyu">
            <Icon type="pizza"></Icon>
            <span>番禺区</span>
        </Radio>
        <Radio label="zencheng">
            <Icon type="help-buoy"></Icon>
            <span>增城区</span>
        </Radio>
        <Radio label="conghua">
           <Icon type="outlet"></Icon>
            <span>从化区</span>
        </Radio> -->
    </Checkbox-group>
    <Table :columns="columns" :data="houseData"></Table>
  </div>
</template>

<script>
import {getHousData, spiderData} from '@/api/fetch'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      nam: '',
      araGroup: [],
      loading: false,
      columns: [
        {
          title: '标题',
          key: 'name'
        },
          {
              title: '链接',
              key: 'url'
          },
          {
              title: '评论',
              key: 'comment'
          },
          {
              title: '作者',
              key: 'author'
          }
        ],
      houseData: [],
      urls: [{
        url: 'https://www.douban.com/group/gz020/',
        label: '广州租房★',
        key: 'gzzf'
      }, {
        url: 'https://www.douban.com/group/yuexiuzufang/',
        label: '广州越秀租房',
        key: 'gzyxzf'
      }, {
        url: 'https://www.douban.com/group/baiyunzufang/',
        label: '广州白云租房',
        key: 'gzbyzf'
      }, {
        url: 'https://www.douban.com/group/tianhezufang/',
        label: '广州天河租房',
        key: 'gzthzf'
      }, {
        url: 'https://www.douban.com/group/liwanzufang/',
        label: '广州荔湾租房',
        key: 'gzlwzf'
      }, {
        url: 'https://www.douban.com/group/haizhuzufang/',
        label: '广州海珠租房',
        key: 'gzhzzf'
      }, {
        url: 'https://www.douban.com/group/panyuzufang/',
        label: '广州番禺租房',
        key: 'gzpyzf'
      }, {
        url: 'https://www.douban.com/group/gz_rent/',
        label: '广州租房',
        key: 'gzzfgr'
      }, {
        url: 'https://www.douban.com/group/zu.gz.soufun/',
        label: '广州租房交友',
        key: 'gzzfjy'
      }, {
        url: 'https://www.douban.com/group/366393/',
        label: '广州真房实客网租房组',
        key: 'gzzswl'
      }, {
        url: 'https://www.douban.com/group/366393/',
        label: '广州公寓租房信息',
        key: 'gzgy'
      }, {
        url: 'https://www.douban.com/group/216688/',
        label: '广州合租联盟---大学',
        key: 'gzhz'
      }, {
        url: 'https://www.douban.com/group/zunar_gz/',
        label: '广州租房族',
        key: 'gzzfz'
      }]
    }
  },
  methods: {
    ratioChange (val) {
      // console.log('val', val)
      // getHousData({area: val})
    },
    async spiderData () {
      this.loading = true
      let data = await spiderData()
      console.log('backdata', data)
      this.loading = false
    }
  },
  watch: {
    araGroup (val) {
      getHousData({label: val})
    }
  }
}
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
